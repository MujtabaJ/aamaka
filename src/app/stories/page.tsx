import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { photos } from "@/lib/photos";

export const metadata = pageMeta({
  title: "Cultural stories",
  description: "History of Sindhi music, Sufi poetry, instruments and studio stories from AA Maka Production.",
  path: "/stories",
});

export default async function StoriesPage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
  return (
    <div className="mx-auto max-w-page px-4 py-16 md:px-6">
      <div
        className="mb-10 h-48 overflow-hidden rounded-3xl bg-cover bg-center"
        style={{ backgroundImage: `url(${photos.writing})` }}
      />
      <p className="text-xs uppercase tracking-[0.28em] text-ajrak">Journal</p>
      <h1 className="mt-3 font-display text-5xl">Cultural stories</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {articles.map((article) => (
          <Link key={article.id} href={`/stories/${article.slug}`} className="overflow-hidden rounded-3xl bg-white shadow-soft">
            {article.coverUrl ? (
              <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${article.coverUrl})` }} />
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
