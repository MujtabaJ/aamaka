import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { getHomepageSection } from "@/lib/homepage";
import { PageHero } from "@/components/content/PageHero";

export const metadata = pageMeta({
  title: "FAQ",
  description: "Answers about AA Maka Production membership, listening and orders.",
  path: "/faq",
});

export default async function FaqPage() {
  const [faqs, section] = await Promise.all([
    prisma.faq.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    }),
    getHomepageSection("faq"),
  ]);
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <PageHero section={section} fallbackTitle="Frequently asked questions" />
      <div className="mt-10 space-y-4">
        {faqs.map((faq) => (
          <article key={faq.id} className="rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="font-display text-2xl">{faq.question}</h2>
            <p className="mt-2 text-ink/70">{faq.answer}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
