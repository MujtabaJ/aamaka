import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations";
import { notify } from "@/lib/notifications";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const limited = rateLimit(`contact:${clientIp(request.headers)}`, Number(process.env.RATE_LIMIT_CONTACT ?? 5));
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many messages. Try again later." }, { status: 429 });
  }
  const form = await request.formData();
  const parsed = contactSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete the form." }, { status: 400 });
  }
  const session = await auth();
  await prisma.contactMessage.create({
    data: { ...parsed.data, userId: session?.user?.id },
  });
  await notify({
    audience: "admin",
    type: "contact",
    title: `Contact: ${parsed.data.subject}`,
    body: `${parsed.data.name} (${parsed.data.email}): ${parsed.data.message}`,
    href: "/admin/notifications",
  });
  return NextResponse.redirect(new URL("/contact?sent=1", request.url), { status: 303 });
}
