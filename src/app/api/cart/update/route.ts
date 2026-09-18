import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getOrCreateCart } from "@/lib/cart";

export async function POST(request: Request) {
  const session = await auth();
  const form = await request.formData();
  const cart = await getOrCreateCart(session?.user?.id);
  const itemId = String(form.get("itemId") ?? "");
  const action = String(form.get("action") ?? "update");
  const quantity = Math.max(0, Number(form.get("quantity") ?? 1));

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
  });
  if (!item) return NextResponse.json({ error: "Item not in cart" }, { status: 404 });

  if (action === "remove" || quantity === 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });
  }

  return NextResponse.redirect(new URL("/cart", request.url), { status: 303 });
}
