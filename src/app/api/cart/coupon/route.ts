import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getOrCreateCart } from "@/lib/cart";

export async function POST(request: Request) {
  const session = await auth();
  const form = await request.formData();
  const code = String(form.get("code") ?? "")
    .trim()
    .toUpperCase();
  const cart = await getOrCreateCart(session?.user?.id);
  if (!code) {
    await prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } });
    return NextResponse.redirect(new URL("/cart", request.url), { status: 303 });
  }
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  const now = new Date();
  const valid =
    coupon &&
    coupon.active &&
    (!coupon.startsAt || coupon.startsAt <= now) &&
    (!coupon.endsAt || coupon.endsAt >= now);
  if (!valid) {
    return NextResponse.redirect(new URL("/cart?coupon=invalid", request.url), { status: 303 });
  }
  await prisma.cart.update({ where: { id: cart.id }, data: { couponId: coupon.id } });
  return NextResponse.redirect(new URL("/cart", request.url), { status: 303 });
}
