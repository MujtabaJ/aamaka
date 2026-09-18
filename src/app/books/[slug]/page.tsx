import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { pageMeta, jsonLd, siteUrl } from "@/lib/seo";
import { formatMoney, effectivePrice, salePercent } from "@/lib/money";
import { Badge, Button, Field, inputClass } from "@/components/ui/primitives";
import { BookCard } from "@/components/books/BookCard";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const book = await prisma.book.findUnique({ where: { slug } });
  if (!book) return pageMeta({ title: "Book", description: "AA Maka books" });
  return pageMeta({
    title: book.seoTitle || book.title,
    description: book.seoDescription || book.excerpt || book.description,
    path: `/books/${book.slug}`,
    image: book.coverUrl,
    type: "product",
  });
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await prisma.book.findUnique({ where: { slug } });
  if (!book || !book.published) notFound();
  const price = effectivePrice(book.pricePaisa, book.salePricePaisa);
  const off = salePercent(book.pricePaisa, book.salePricePaisa);
  const related = await prisma.book.findMany({
    where: { published: true, category: book.category, NOT: { id: book.id } },
    take: 4,
  });
  const digital = book.format === "ebook";

  return (
    <div className="mx-auto max-w-page px-4 py-16 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "Book",
          name: book.title,
          author: book.author,
          inLanguage: book.language,
          isbn: book.isbn,
          numberOfPages: book.pages,
          image: book.coverUrl,
          publisher: book.publisher,
          offers: {
            "@type": "Offer",
            priceCurrency: "PKR",
            price: price / 100,
            availability: book.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: siteUrl(`/books/${book.slug}`),
          },
        })}
      />
      <div className="grid gap-10 md:grid-cols-[280px_1fr]">
        <div
          className="aspect-[3/4] rounded-3xl bg-sand bg-cover bg-center shadow-soft"
          style={{ backgroundImage: book.coverUrl ? `url(${book.coverUrl})` : undefined }}
        />
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ajrak">
            {book.category} · {book.format}
          </p>
          <h1 className="mt-2 font-display text-5xl">{book.title}</h1>
          {book.titleSd ? <p className="mt-2 font-sindhi text-2xl">{book.titleSd}</p> : null}
          <p className="mt-3 text-lg text-ink/70">{book.author}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl">{formatMoney(price)}</span>
            {off ? <Badge tone="gold">{off}% off</Badge> : null}
          </div>
          <p className="mt-4 text-ink/75">{book.excerpt || book.description}</p>
          <dl className="mt-6 grid gap-2 text-sm text-ink/70 md:grid-cols-2">
            <div>
              <dt className="text-gold-600">Publisher</dt>
              <dd>{book.publisher}</dd>
            </div>
            {book.pages ? (
              <div>
                <dt className="text-gold-600">Pages</dt>
                <dd>{book.pages}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-gold-600">Language</dt>
              <dd>{book.language}</dd>
            </div>
            {book.isbn ? (
              <div>
                <dt className="text-gold-600">ISBN</dt>
                <dd>{book.isbn}</dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-3 text-sm">
            {digital ? "Digital edition — access in My Library after payment." : book.stock > 0 ? `${book.stock} in stock` : "Out of stock"}
          </p>
          <div className="mt-6 flex flex-wrap items-end gap-3">
            <form action="/api/cart/add" method="post" className="flex items-end gap-3">
              <input type="hidden" name="kind" value="book" />
              <input type="hidden" name="bookId" value={book.id} />
              {!digital ? (
                <Field label="Quantity">
                  <input name="quantity" type="number" min={1} defaultValue={1} className={inputClass} />
                </Field>
              ) : null}
              <Button type="submit" variant="primary" disabled={!digital && book.stock <= 0}>
                Add to cart
              </Button>
            </form>
            <form action="/api/wishlist" method="post">
              <input type="hidden" name="kind" value="book" />
              <input type="hidden" name="id" value={book.id} />
              <Button type="submit" variant="secondary">
                Wishlist
              </Button>
            </form>
          </div>
          <div className="prose prose-aamaka mt-8 max-w-none text-sm">
            <p>{book.description}</p>
          </div>
        </div>
      </div>
      {related.length ? (
        <section className="mt-16">
          <h2 className="font-display text-3xl">Related titles</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <BookCard key={item.id} book={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
