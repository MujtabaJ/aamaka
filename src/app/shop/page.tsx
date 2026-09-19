import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { ProductCard } from "@/components/shop/ProductCard";
import { getHomepageSection } from "@/lib/homepage";
import { PageHero } from "@/components/content/PageHero";
import Link from "next/link";

export const metadata = pageMeta({
  title: "Sindhi Culture Products",
  description: "Shop ajrak, Sindhi topi, rilli, handicrafts and organic products from AA Maka Production.",
  path: "/shop",
});

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, products, section] = await Promise.all([
    prisma.productCategory.findMany({
      where: { published: true, parentId: null },
      include: { children: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: {
        status: "published",
        ...(category
          ? { category: { OR: [{ slug: category }, { parent: { slug: category } }] } }
          : {}),
      },
      include: { category: true },
    }),
    getHomepageSection("shop"),
  ]);
  return (
    <div className="mx-auto max-w-page px-4 py-16 md:px-6">
      <PageHero section={section} fallbackTitle="Shop Sindhi culture" />
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/shop" className="rounded-full border border-ink/15 px-3 py-1 text-sm">
          All
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={`/shop?category=${c.slug}`} className="rounded-full border border-ink/15 px-3 py-1 text-sm">
            {c.name}
          </Link>
        ))}
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
