import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fulfillOrder } from "@/lib/orders";
import { notify, templates } from "@/lib/notifications";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature") ?? request.headers.get("x-webhook-signature");
  const raw = await request.text();

  if (!process.env.STRIPE_WEBHOOK_SECRET && !process.env.JAZZCASH_INTEGERITY_SALT) {
    return NextResponse.json(
      {
        error:
          "No payment webhook secret is configured. Live card or wallet webhooks will not be accepted.",
      },
      { status: 501 },
    );
  }

  let reference: string | undefined;
  try {
    const payload = JSON.parse(raw) as { reference?: string; id?: string };
    reference = payload.reference || payload.id;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!signature || !reference) {
    return NextResponse.json({ error: "Missing signature or reference" }, { status: 400 });
  }

  const payment = await prisma.payment.findFirst({
    where: { reference },
    include: { order: true },
  });
  if (!payment) return NextResponse.json({ error: "Unknown payment" }, { status: 404 });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "paid", rawPayload: raw },
  });
  await prisma.order.update({
    where: { id: payment.orderId },
    data: { paymentStatus: "paid", status: "paid" },
  });
  await fulfillOrder(payment.orderId);
  const msg = templates.paymentConfirmation(payment.order.number);
  await notify({ ...msg, userId: payment.order.userId, orderId: payment.orderId });

  return NextResponse.json({ received: true });
}
