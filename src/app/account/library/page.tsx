import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AlbumCard } from "@/components/music/AlbumCard";
import { BookCard } from "@/components/books/BookCard";

export default async function LibraryPage() {
  const user = await requireUser();
  const entitlements = await prisma.entitlement.findMany({
    where: { userId: user.id },
    include: { album: { include: { artist: true, tracks: true } }, book: true },
  });
  const albums = entitlements.map((e) => e.album).filter(Boolean);
  const books = entitlements.map((e) => e.book).filter(Boolean);
  return (
    <div>
      <h1 className="font-display text-4xl">My library</h1>
      <p className="mt-2 text-sm text-ink/60">Purchased albums and ebooks stay available while your account is active.</p>
      <h2 className="mt-8 font-display text-2xl">Albums</h2>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {albums.map((album) => (album ? <AlbumCard key={album.id} album={album} /> : null))}
      </div>
      {albums.length === 0 ? <p className="mt-4 text-ink/60">No purchased albums yet.</p> : null}
      <h2 className="mt-10 font-display text-2xl">Books</h2>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {books.map((book) => (book ? <BookCard key={book.id} book={book} /> : null))}
      </div>
      {books.length === 0 ? <p className="mt-4 text-ink/60">No purchased ebooks yet.</p> : null}
    </div>
  );
}
