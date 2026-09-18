import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { effectivePrice } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { parseJson } from "@/lib/utils";

export const CART_COOKIE = "aamaka_cart";

export async function getOrCreateCart(userId?: string | null) {
  const jar = await cookies();
  const sessionId = jar.get(CART_COOKIE)?.value;

  if (userId) {
    const existing = await prisma.cart.findFirst({
      where: { userId },
      include: cartInclude,
    });
    if (existing) {
      if (sessionId && sessionId !== existing.sessionId) {
        await mergeGuestCart(existing.id, sessionId);
      }
      return prisma.cart.findUniqueOrThrow({ where: { id: existing.id }, include: cartInclude });
    }
  }

  if (sessionId) {
    const guest = await prisma.cart.findUnique({
      where: { sessionId },
      include: cartInclude,
    });
    if (guest) {
      if (userId && !guest.userId) {
        return prisma.cart.update({
          where: { id: guest.id },
          data: { userId },
          include: cartInclude,
        });
      }
      return guest;
    }
  }

  const created = await prisma.cart.create({
    data: {
      userId: userId ?? undefined,
      sessionId: sessionId ?? crypto.randomUUID(),
    },
    include: cartInclude,
  });

  jar.set(CART_COOKIE, created.sessionId ?? created.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return created;
}

async function mergeGuestCart(userCartId: string, sessionId: string) {
  const guest = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: true },
  });
  if (!guest || guest.id === userCartId) return;
  for (const item of guest.items) {
    await prisma.cartItem.create({
      data: {
        cartId: userCartId,
        kind: item.kind,
        productId: item.productId,
        variantId: item.variantId,
        albumId: item.albumId,
        planId: item.planId,
        bookId: item.bookId,
        quantity: item.quantity,
      },
    });
  }
  await prisma.cart.delete({ where: { id: guest.id } });
}

const cartInclude = {
  coupon: true,
  items: {
    include: {
      product: true,
      variant: true,
      book: true,
    },
  },
} as const;

export type CartWithItems = Awaited<ReturnType<typeof getOrCreateCart>>;

export async function summarizeCart(cart: CartWithItems) {
  const settings = await getSettings();
  const albumIds = cart.items.filter((i) => i.albumId).map((i) => i.albumId!) ;
  const albums = albumIds.length
    ? await prisma.album.findMany({ where: { id: { in: albumIds } } })
    : [];
  const albumMap = Object.fromEntries(albums.map((a) => [a.id, a]));
  const plans = cart.items.filter((i) => i.planId).map((i) => i.planId!);
  const memberships = plans.length
    ? await prisma.membershipPlan.findMany({ where: { id: { in: plans } } })
    : [];
  const planMap = Object.fromEntries(memberships.map((p) => [p.id, p]));

  const lines = cart.items.map((item) => {
    if (item.kind === "product" && item.product) {
      const unit = item.variant?.pricePaisa ?? effectivePrice(item.product.pricePaisa, item.product.salePricePaisa);
      return {
        id: item.id,
        kind: item.kind,
        title: item.variant ? `${item.product.name} — ${item.variant.name}` : item.product.name,
        quantity: item.quantity,
        unitPaisa: unit,
        totalPaisa: unit * item.quantity,
        digital: false,
        image: parseJson<string[]>(item.product.images, [])[0],
      };
    }
    if (item.kind === "album" && item.albumId && albumMap[item.albumId]) {
      const album = albumMap[item.albumId];
      const unit = effectivePrice(album.pricePaisa, album.salePricePaisa);
      return {
        id: item.id,
        kind: item.kind,
        title: album.title,
        quantity: 1,
        unitPaisa: unit,
        totalPaisa: unit,
        digital: true,
        image: album.coverUrl,
      };
    }
    if (item.kind === "plan" && item.planId && planMap[item.planId]) {
      const plan = planMap[item.planId];
      return {
        id: item.id,
        kind: item.kind,
        title: plan.name,
        quantity: 1,
        unitPaisa: plan.pricePaisa,
        totalPaisa: plan.pricePaisa,
        digital: true,
        image: undefined,
      };
    }
    if (item.kind === "book" && item.book) {
      const unit = effectivePrice(item.book.pricePaisa, item.book.salePricePaisa);
      const digital = item.book.format === "ebook";
      return {
        id: item.id,
        kind: item.kind,
        title: item.book.title,
        quantity: item.quantity,
        unitPaisa: unit,
        totalPaisa: unit * item.quantity,
        digital,
        image: item.book.coverUrl,
      };
    }
    return {
      id: item.id,
      kind: item.kind,
      title: "Item",
      quantity: item.quantity,
      unitPaisa: 0,
      totalPaisa: 0,
      digital: false,
    };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.totalPaisa, 0);
  let discount = 0;
  if (cart.coupon && cart.coupon.active) {
    if (cart.coupon.type === "percent") {
      discount = Math.round((subtotal * cart.coupon.value) / 100);
    } else {
      discount = cart.coupon.value;
    }
    if (discount > subtotal) discount = subtotal;
  }

  const hasPhysical = lines.some((l) => !l.digital);
  const afterDiscount = subtotal - discount;
  const shipping =
    hasPhysical && afterDiscount < settings.freeShippingOverPaisa ? settings.shippingFeePaisa : 0;
  const tax = Math.round((afterDiscount * settings.taxPercent) / 100);
  const total = afterDiscount + shipping + tax;

  return {
    lines,
    subtotalPaisa: subtotal,
    discountPaisa: discount,
    shippingPaisa: shipping,
    taxPaisa: tax,
    totalPaisa: total,
    hasPhysical,
    hasDigital: lines.some((l) => l.digital),
    coupon: cart.coupon,
  };
}
