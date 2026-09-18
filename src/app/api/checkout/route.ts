import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart, summarizeCart } from "@/lib/cart";
import { checkoutSchema } from "@/lib/validations";
import { availableMethods, startPayment } from "@/lib/payments";
import { nextOrderNumber } from "@/lib/data";
import { notify, templates } from "@/lib/notifications";
import { fulfillOrder } from "@/lib/orders";
import { siteUrl } from "@/lib/utils";

export async function POST(request: Request) {
  const session = await auth();
  const form = await request.formData();
  const parsed = checkoutSchema.safeParse({
    email: form.get("email"),
    phone: form.get("phone"),
    paymentMethod: form.get("paymentMethod"),
    notes: form.get("notes") || undefined,
    address: form.get("line1")
      ? {
          label: "Shipping",
          fullName: form.get("fullName"),
          phone: form.get("phone"),
          line1: form.get("line1"),
          line2: form.get("line2") || undefined,
          city: form.get("city"),
          province: form.get("province"),
          postalCode: form.get("postalCode") || undefined,
        }
      : undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete the checkout form." }, { status: 400 });
  }

  const cart = await getOrCreateCart(session?.user?.id);
  const summary = await summarizeCart(cart);
  if (summary.lines.length === 0) {
    return NextResponse.redirect(new URL("/cart", request.url), { status: 303 });
  }

  const methods = availableMethods({
    hasPhysical: summary.hasPhysical,
    hasDigital: summary.hasDigital,
  });
  const method = methods.find((m) => m.id === parsed.data.paymentMethod);
  if (!method?.enabled) {
    return NextResponse.json(
      { error: "That payment method is not available for this order." },
      { status: 400 },
    );
  }
  if (summary.hasPhysical && !parsed.data.address) {
    return NextResponse.json({ error: "A shipping address is required." }, { status: 400 });
  }

  const number = await nextOrderNumber();
  const order = await prisma.order.create({
    data: {
      number,
      userId: session?.user?.id,
      email: parsed.data.email,
      phone: parsed.data.phone,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: parsed.data.paymentMethod,
      subtotalPaisa: summary.subtotalPaisa,
      discountPaisa: summary.discountPaisa,
      shippingPaisa: summary.shippingPaisa,
      taxPaisa: summary.taxPaisa,
      totalPaisa: summary.totalPaisa,
      couponCode: summary.coupon?.code,
      notes: parsed.data.notes,
      shippingSnapshot: JSON.stringify(parsed.data.address ?? {}),
      items: {
        create: await Promise.all(
          cart.items.map(async (item) => {
            const line = summary.lines.find((l) => l.id === item.id);
            return {
              kind: item.kind,
              title: line?.title ?? "Item",
              quantity: item.quantity,
              unitPaisa: line?.unitPaisa ?? 0,
              totalPaisa: line?.totalPaisa ?? 0,
              productId: item.productId,
              variantId: item.variantId,
              albumId: item.albumId,
              planId: item.planId,
              bookId: item.bookId,
            };
          }),
        ),
      },
    },
  });

  const pay = await startPayment({
    orderId: order.id,
    amountPaisa: order.totalPaisa,
    currency: "PKR",
    method: parsed.data.paymentMethod,
    customerEmail: parsed.data.email,
    returnUrl: siteUrl(`/account/orders/${order.id}`),
  });

  if (!pay.ok) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "failed", paymentStatus: "failed" },
    });
    return NextResponse.json({ error: pay.error }, { status: 400 });
  }

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: pay.provider,
      method: parsed.data.paymentMethod,
      status: pay.status,
      amountPaisa: order.totalPaisa,
      reference: pay.reference,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentProvider: pay.provider,
      paymentReference: pay.reference,
      paymentStatus: pay.status === "paid" ? "paid" : "pending",
      status: pay.status === "paid" ? "paid" : "payment_pending",
    },
  });

  if (pay.status === "paid") {
    await fulfillOrder(order.id);
  }

  if (summary.coupon && session?.user?.id) {
    await prisma.couponUsage.create({
      data: { couponId: summary.coupon.id, userId: session.user.id, orderId: order.id },
    });
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  await prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } });

  const msg = templates.orderConfirmation(order.number);
  await notify({
    ...msg,
    userId: session?.user?.id,
    orderId: order.id,
    href: `/account/orders/${order.id}`,
  });
  await notify({
    audience: "admin",
    type: "new_order",
    title: `New order ${order.number}`,
    body: `${parsed.data.email} placed an order for PKR ${(order.totalPaisa / 100).toFixed(0)}.`,
    href: `/admin/orders/${order.id}`,
    orderId: order.id,
  });

  return NextResponse.redirect(new URL(`/checkout/thanks?order=${order.number}`, request.url), {
    status: 303,
  });
}
