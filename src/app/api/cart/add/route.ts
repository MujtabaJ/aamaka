import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getOrCreateCart } from "@/lib/cart";

export async function POST(request: Request) {
  const session = await auth();
  const form = await request.formData();
  const kind = String(form.get("kind") ?? "product");
  const cart = await getOrCreateCart(session?.user?.id);

  if (kind === "product") {
    const productId = String(form.get("productId") ?? "");
    const variantId = String(form.get("variantId") ?? "") || null;
    const quantity = Math.max(1, Number(form.get("quantity") ?? 1));
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: productId }, { slug: productId }], status: "published" },
    });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        kind: "product",
        productId: product.id,
        variantId,
        quantity,
      },
    });
  } else if (kind === "album") {
    const albumKey = String(form.get("albumId") ?? "");
    const album = await prisma.album.findFirst({
      where: { OR: [{ id: albumKey }, { slug: albumKey }], published: true },
    });
    if (!album) return NextResponse.json({ error: "Album not found" }, { status: 404 });
    const existing = cart.items.find((i) => i.albumId === album.id);
    if (!existing) {
      await prisma.cartItem.create({
        data: { cartId: cart.id, kind: "album", albumId: album.id, quantity: 1 },
      });
    }
  } else if (kind === "plan") {
    const planId = String(form.get("planId") ?? "");
    const plan = await prisma.membershipPlan.findFirst({
      where: { OR: [{ id: planId }, { slug: planId }], active: true },
    });
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, kind: "plan" } });
    await prisma.cartItem.create({
      data: { cartId: cart.id, kind: "plan", planId: plan.id, quantity: 1 },
    });
  } else if (kind === "book") {
    const bookKey = String(form.get("bookId") ?? "");
    const book = await prisma.book.findFirst({
      where: { OR: [{ id: bookKey }, { slug: bookKey }], published: true },
    });
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });
    const quantity = Math.max(1, Number(form.get("quantity") ?? 1));
    await prisma.cartItem.create({
      data: { cartId: cart.id, kind: "book", bookId: book.id, quantity },
    });
  }

  return NextResponse.redirect(new URL("/cart", request.url), { status: 303 });
}
