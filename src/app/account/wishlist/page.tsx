import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function WishlistPage() {
  const user = await requireUser();
  const items = await prisma.wishlist.findMany({
    where: { userId: user.id },
    include: { product: true, album: true, song: true, book: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="font-display text-4xl">Wishlist</h1>
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl bg-white p-4">
            {item.product ? <Link href={`/shop/${item.product.slug}`}>{item.product.name}</Link> : null}
            {item.album ? <Link href={`/music/album/${item.album.slug}`}>{item.album.title}</Link> : null}
            {item.song ? <Link href={`/music/song/${item.song.slug}`}>{item.song.title}</Link> : null}
            {item.book ? <Link href={`/books/${item.book.slug}`}>{item.book.title}</Link> : null}
          </li>
        ))}
        {items.length === 0 ? <p>Nothing saved yet.</p> : null}
      </ul>
    </div>
  );
}
