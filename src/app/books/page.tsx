import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { BookCard } from "@/components/books/BookCard";
import { getHomepageSection } from "@/lib/homepage";
import { PageHero } from "@/components/content/PageHero";

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
  const [categories, books, section] = await Promise.all([
    prisma.book.findMany({
      where: { published: true },
      select: { category: true },
      distinct: ["category"],
    }),
    prisma.book.findMany({
      where: { published: true, ...(category ? { category } : {}) },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
    getHomepageSection("books"),
  ]);

  return (
    <div className="mx-auto max-w-page px-4 py-16 md:px-6">
      <PageHero section={section} fallbackTitle="Sindhi books" />
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
