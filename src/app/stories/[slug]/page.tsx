import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { prisma } from "@/lib/prisma";
import { pageMeta, jsonLd, siteUrl } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) return pageMeta({ title: "Story", description: "AA Maka stories" });
  return pageMeta({
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    path: `/stories/${article.slug}`,
    image: article.coverUrl,
    type: "article",
  });
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article || !article.published) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          datePublished: article.publishedAt,
          author: article.authorName,
          url: siteUrl(`/stories/${article.slug}`),
        })}
      />
      <p className="text-xs uppercase tracking-[0.24em] text-ajrak">{formatDate(article.publishedAt)}</p>
      <h1 className="mt-3 font-display text-5xl">{article.title}</h1>
      {article.coverUrl ? (
        <div
          className="mt-8 aspect-[16/8] rounded-3xl bg-cover bg-center"
          style={{ backgroundImage: `url(${article.coverUrl})` }}
        />
      ) : null}
      <p className="mt-4 text-ink/70">{article.excerpt}</p>
      <div className="prose prose-aamaka mt-8 max-w-none">
        <Markdown>{article.body}</Markdown>
      </div>
    </article>
  );
}
