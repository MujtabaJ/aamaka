import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LOCALE_COOKIE } from "@/lib/locale";

export async function POST(request: Request) {
  const { locale } = await request.json();
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale === "sd" ? "sd" : "en", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return NextResponse.json({ ok: true });
}
