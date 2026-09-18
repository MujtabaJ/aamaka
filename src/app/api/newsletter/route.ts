import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validations";
import { notify } from "@/lib/notifications";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const limited = rateLimit(`newsletter:${ip}`, 8);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const form = await request.formData().catch(() => null);
  const json = form ? Object.fromEntries(form) : await request.json().catch(() => ({}));
  const parsed = newsletterSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email.toLowerCase() },
    update: { status: "active", name: parsed.data.name },
    create: { email: parsed.data.email.toLowerCase(), name: parsed.data.name },
  });

  await notify({
    audience: "admin",
    type: "newsletter",
    title: "New newsletter subscriber",
    body: parsed.data.email,
  });

  return NextResponse.redirect(new URL("/?subscribed=1", request.url), { status: 303 });
}
