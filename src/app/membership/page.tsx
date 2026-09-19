import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { formatMoney } from "@/lib/money";
import { parseJson } from "@/lib/utils";
import { Button } from "@/components/ui/primitives";
import { getHomepageSection } from "@/lib/homepage";
import { PageHero } from "@/components/content/PageHero";
import Link from "next/link";

export const metadata = pageMeta({
  title: "Membership",
  description: "Become an AA Maka Production member for full Sindhi music, exclusive releases and early access.",
  path: "/membership",
});

export default async function MembershipPage() {
  const [plans, section] = await Promise.all([
    prisma.membershipPlan.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    getHomepageSection("membership"),
  ]);
  return (
    <div className="mx-auto max-w-page px-4 py-16 md:px-6">
      <PageHero section={section} fallbackTitle="Unlock the full song. Keep the culture close." />
      <p className="mt-4 max-w-2xl text-sm text-ink/60">
        See the <Link href="/faq" className="text-ajrak">FAQ</Link> for access details.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const features = parseJson<string[]>(plan.features, []);
          return (
            <article key={plan.id} className="rounded-3xl bg-white p-6 shadow-soft">
              <p className="text-xs uppercase tracking-[0.2em] text-gold">{plan.interval}</p>
              <h2 className="mt-2 font-display text-3xl">{plan.name}</h2>
              <p className="mt-3 text-2xl">{formatMoney(plan.pricePaisa)}</p>
              <p className="mt-3 text-sm text-ink/70">{plan.description}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <form action="/api/cart/add" method="post" className="mt-6">
                <input type="hidden" name="kind" value="plan" />
                <input type="hidden" name="planId" value={plan.id} />
                <Button type="submit" variant="primary" className="w-full">
                  Become a member
                </Button>
              </form>
            </article>
          );
        })}
      </div>
    </div>
  );
}
