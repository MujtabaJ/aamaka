import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { getHomepageSection } from "@/lib/homepage";
import { PageHero } from "@/components/content/PageHero";
import { freshSrc } from "@/lib/image-specs";

export const metadata = pageMeta({
  title: "Cultural stories",
  description: "History of Sindhi music, Sufi poetry, instruments and studio stories from AA Maka Production.",
  path: "/stories",
});

export default async function StoriesPage() {
  const [articles, section] = await Promise.all([
    prisma.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    }),
    getHomepageSection("stories"),
  ]);
  return (
    <div className="mx-auto max-w-page px-4 py-16 md:px-6">
      <PageHero section={section} fallbackTitle="Cultural stories" />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {articles.map((article) => (
          <Link key={article.id} href={`/stories/${article.slug}`} className="overflow-hidden rounded-3xl bg-white shadow-soft">
            {article.coverUrl ? (
              <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${freshSrc(article.coverUrl, article.updatedAt)})` }} />
            ) : null}
            <div className="p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-gold">{formatDate(article.publishedAt)}</p>
              <h2 className="mt-3 font-display text-2xl">{article.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-ink/70">{article.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
