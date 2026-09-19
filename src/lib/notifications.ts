import { prisma } from "@/lib/prisma";

type NotifyInput = {
  type: string;
  title: string;
  body: string;
  href?: string;
  userId?: string | null;
  audience?: "user" | "admin";
  orderId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function notify(input: NotifyInput) {
  await prisma.notification.create({
    data: {
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href,
      userId: input.userId ?? undefined,
      audience: input.audience ?? (input.userId ? "user" : "admin"),
      orderId: input.orderId ?? undefined,
      metadata: JSON.stringify(input.metadata ?? {}),
      channel: "inapp",
    },
  });

  await deliverEmail(input);
}

async function deliverEmail(input: NotifyInput) {
  const { sendMail } = await import("@/lib/mail");
  const to =
    input.audience === "admin"
      ? process.env.NOTIFY_ADMIN_EMAIL
      : await resolveUserEmail(input.userId);
  await sendMail({
    to,
    subject: input.title,
    text: input.body,
    href: input.href,
  });
}

async function resolveUserEmail(userId?: string | null) {
  if (!userId) return undefined;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  return user?.email;
}

export const templates = {
  welcome: (name: string) => ({
    type: "welcome",
    title: "Welcome to AA Maka Production",
    body: `Salaam ${name}, thank you for joining the AA Maka Production community.`,
    href: "/account",
  }),
  orderConfirmation: (number: string) => ({
    type: "order_confirmation",
    title: `Order ${number} received`,
    body: `We have received your order ${number}. You will get updates as it moves.`,
    href: "/account/orders",
  }),
  paymentConfirmation: (number: string) => ({
    type: "payment_confirmation",
    title: `Payment received for ${number}`,
    body: `Payment for order ${number} has been confirmed.`,
    href: "/account/orders",
  }),
  shipped: (number: string) => ({
    type: "order_shipped",
    title: `Order ${number} has shipped`,
    body: `Your AA Maka Production order is on the way.`,
    href: "/account/orders",
  }),
  delivered: (number: string) => ({
    type: "order_delivered",
    title: `Order ${number} delivered`,
    body: `Your order has been marked as delivered.`,
    href: "/account/orders",
  }),
  subscriptionActivated: (plan: string) => ({
    type: "subscription_activated",
    title: "Membership activated",
    body: `Your ${plan} membership is now active. Full premium music is unlocked.`,
    href: "/account/membership",
  }),
  subscriptionExpiring: (plan: string) => ({
    type: "subscription_expiring",
    title: "Membership expiring soon",
    body: `Your ${plan} membership will expire soon. Renew to keep full access.`,
    href: "/membership",
  }),
};
