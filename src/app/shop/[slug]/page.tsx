import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { pageMeta, jsonLd, siteUrl } from "@/lib/seo";
import { formatMoney, effectivePrice, salePercent } from "@/lib/money";
import { parseJson } from "@/lib/utils";
import { Badge, Button, Field, inputClass } from "@/components/ui/primitives";
import { ProductCard } from "@/components/shop/ProductCard";
import { ReviewForm } from "@/components/shop/ReviewForm";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return pageMeta({ title: "Product", description: "AA Maka shop" });
  return pageMeta({
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription || product.description,
    path: `/shop/${product.slug}`,
    image: parseJson<string[]>(product.images, [])[0],
    type: "product",
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: true,
      reviews: { where: { status: "approved" }, include: { user: true } },
    },
  });
  if (!product || product.status !== "published") notFound();
  const images = parseJson<string[]>(product.images, []);
  const price = effectivePrice(product.pricePaisa, product.salePricePaisa);
  const off = salePercent(product.pricePaisa, product.salePricePaisa);
  const related = await prisma.product.findMany({
    where: { status: "published", categoryId: product.categoryId, NOT: { id: product.id } },
    include: { category: true },
    take: 4,
  });

  return (
    <div className="mx-auto max-w-page px-4 py-16 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          sku: product.sku,
          image: images,
          offers: {
            "@type": "Offer",
            priceCurrency: "PKR",
            price: price / 100,
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: siteUrl(`/shop/${product.slug}`),
          },
        })}
      />
      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-[4/5] rounded-3xl bg-sand bg-cover bg-center" style={{ backgroundImage: images[0] ? `url(${images[0]})` : undefined }} />
          <div className="grid grid-cols-4 gap-2">
            {images.slice(1, 5).map((img) => (
              <div key={img} className="aspect-square rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ajrak">{product.category.name}</p>
          <h1 className="mt-2 font-display text-5xl">{product.name}</h1>
          {product.nameSd ? <p className="mt-2 font-sindhi text-xl">{product.nameSd}</p> : null}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl">{formatMoney(price)}</span>
            {off ? <Badge tone="gold">{off}% off</Badge> : null}
          </div>
          <p className="mt-4 text-ink/70">{product.shortDescription}</p>
          <p className="mt-2 text-sm">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>
          <form action="/api/cart/add" method="post" className="mt-6 space-y-4">
            <input type="hidden" name="kind" value="product" />
            <input type="hidden" name="productId" value={product.id} />
            {product.variants.length ? (
              <Field label="Variant">
                <select name="variantId" className={inputClass}>
                  {product.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} {v.stock <= 0 ? "(out of stock)" : ""}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}
            <Field label="Quantity">
              <input name="quantity" type="number" min={1} defaultValue={1} className={inputClass} />
            </Field>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" variant="primary" disabled={product.stock <= 0}>
                Add to cart
              </Button>
              <Button href="/checkout" variant="gold">
                Buy now
              </Button>
            </div>
          </form>
          <form action="/api/wishlist" method="post" className="mt-3">
            <input type="hidden" name="kind" value="product" />
            <input type="hidden" name="id" value={product.id} />
            <Button type="submit" variant="secondary">
              Wishlist
            </Button>
          </form>
          <div className="prose prose-aamaka mt-8 max-w-none text-sm">
            <p>{product.description}</p>
            {product.shippingInfo ? <p>{product.shippingInfo}</p> : null}
          </div>
        </div>
      </div>
      <section className="mt-16">
        <h2 className="font-display text-3xl">Reviews</h2>
        <div className="mt-4 space-y-4">
          {product.reviews.length === 0 ? <p className="text-sm text-ink/60">No reviews yet.</p> : null}
          {product.reviews.map((review) => (
            <article key={review.id} className="rounded-2xl bg-white p-4">
              <p className="text-sm font-medium">{review.user.name} · {review.rating}/5</p>
              <p className="mt-1 text-sm text-ink/70">{review.body}</p>
            </article>
          ))}
        </div>
        <ReviewForm productId={product.id} slug={product.slug} />
      </section>
      {related.length ? (
        <section className="mt-16">
          <h2 className="font-display text-3xl">Related</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
