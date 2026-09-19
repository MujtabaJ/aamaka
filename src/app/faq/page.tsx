import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { photos } from "@/lib/photos";

export const metadata = pageMeta({
  title: "FAQ",
  description: "Answers about AA Maka Production membership, listening and orders.",
  path: "/faq",
});

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <div
        className="mb-10 h-48 overflow-hidden rounded-3xl bg-cover bg-center"
        style={{ backgroundImage: `url(${photos.listening})` }}
      />
      <p className="text-xs uppercase tracking-[0.28em] text-ajrak">Help</p>
      <h1 className="mt-3 font-display text-5xl">Frequently asked questions</h1>
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
