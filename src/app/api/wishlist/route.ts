import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }
  const form = await request.formData();
  const kind = String(form.get("kind"));
  await prisma.wishlist.create({
    data: {
      userId: session.user.id,
      kind,
      productId: kind === "product" ? String(form.get("id")) : undefined,
      albumId: kind === "album" ? String(form.get("id")) : undefined,
      songId: kind === "song" ? String(form.get("id")) : undefined,
      bookId: kind === "book" ? String(form.get("id")) : undefined,
    },
  });
  return NextResponse.redirect(new URL("/account/wishlist", request.url), { status: 303 });
}
