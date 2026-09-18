import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.sitePage.findUnique({ where: { slug } });
  return pageMeta({
    title: page?.seoTitle || page?.title || "Policy",
    description: page?.seoDescription || page?.title || "AA Maka Production policy",
    path: `/policies/${slug}`,
  });
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.sitePage.findUnique({ where: { slug } });
  if (!page) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-display text-5xl">{page.title}</h1>
      <div className="prose prose-aamaka mt-8 max-w-none whitespace-pre-wrap">{page.body}</div>
    </div>
  );
}
