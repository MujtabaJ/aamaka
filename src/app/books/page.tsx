import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { BookCard } from "@/components/books/BookCard";
import { photos } from "@/lib/photos";

export const metadata = pageMeta({
  title: "Sindhi Books",
  description: "Sindhi poetry, Sufi literature, folk tales and cultural books from AA Maka Production.",
  path: "/books",
});

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, books] = await Promise.all([
    prisma.book.findMany({
      where: { published: true },
      select: { category: true },
      distinct: ["category"],
    }),
    prisma.book.findMany({
      where: { published: true, ...(category ? { category } : {}) },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div className="mx-auto max-w-page px-4 py-16 md:px-6">
      <div
        className="mb-10 h-48 overflow-hidden rounded-3xl bg-cover bg-center"
        style={{ backgroundImage: `url(${photos.libraryHall})` }}
      />
      <p className="text-xs uppercase tracking-[0.28em] text-ajrak">Library</p>
      <h1 className="mt-3 font-display text-5xl">Sindhi books</h1>
      <p className="mt-4 max-w-2xl text-ink/70">
        Poetry companions, Sufi reading, folk tales and cultural essays — printed and digital editions
        from the AA Maka archive.
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/books" className="rounded-full border border-ink/15 px-3 py-1 text-sm">
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.category}
            href={`/books?category=${encodeURIComponent(c.category)}`}
            className="rounded-full border border-ink/15 px-3 py-1 text-sm capitalize"
          >
            {c.category}
          </Link>
        ))}
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
