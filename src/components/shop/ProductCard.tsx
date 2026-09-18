import Link from "next/link";
import { formatMoney, effectivePrice, salePercent } from "@/lib/money";
import { parseJson } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives";

export function ProductCard({
  product,
}: {
  product: {
    slug: string;
    name: string;
    images: string;
    pricePaisa: number;
    salePricePaisa?: number | null;
    stock: number;
    category?: { name: string } | null;
  };
}) {
  const image = parseJson<string[]>(product.images, [])[0];
  const price = effectivePrice(product.pricePaisa, product.salePricePaisa);
  const off = salePercent(product.pricePaisa, product.salePricePaisa);
  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-soft">
      <Link href={`/shop/${product.slug}`} className="block aspect-[4/5] bg-sand bg-cover bg-center" style={{ backgroundImage: image ? `url(${image})` : undefined }} />
      <div className="space-y-1 p-4">
        {product.category ? (
          <p className="text-[11px] uppercase tracking-[0.18em] text-ajrak">{product.category.name}</p>
        ) : null}
        <Link href={`/shop/${product.slug}`} className="font-display text-xl">
          {product.name}
        </Link>
        <div className="flex items-center gap-2">
          <span>{formatMoney(price)}</span>
          {off ? <Badge tone="gold">{off}% off</Badge> : null}
        </div>
        {product.stock <= 0 ? <p className="text-xs text-ajrak">Out of stock</p> : null}
      </div>
    </article>
  );
}
