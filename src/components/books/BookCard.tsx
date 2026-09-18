import Link from "next/link";
import { formatMoney, effectivePrice, salePercent } from "@/lib/money";
import { Badge } from "@/components/ui/primitives";

export function BookCard({
  book,
}: {
  book: {
    slug: string;
    title: string;
    author: string;
    coverUrl?: string | null;
    category?: string | null;
    format?: string | null;
    pricePaisa: number;
    salePricePaisa?: number | null;
    stock?: number;
  };
}) {
  const price = effectivePrice(book.pricePaisa, book.salePricePaisa);
  const off = salePercent(book.pricePaisa, book.salePricePaisa);
  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-soft">
      <Link
        href={`/books/${book.slug}`}
        className="block aspect-[3/4] bg-sand bg-cover bg-center"
        style={{ backgroundImage: book.coverUrl ? `url(${book.coverUrl})` : undefined }}
      />
      <div className="space-y-1 p-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ajrak">
          {book.category}
          {book.format ? ` · ${book.format}` : ""}
        </p>
        <Link href={`/books/${book.slug}`} className="font-display text-xl">
          {book.title}
        </Link>
        <p className="text-sm text-ink/60">{book.author}</p>
        <div className="flex items-center gap-2 pt-1">
          <span>{formatMoney(price)}</span>
          {off ? <Badge tone="gold">{off}% off</Badge> : null}
        </div>
      </div>
    </article>
  );
}
