import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { formatMoney } from "@/lib/money";
import { parseJson } from "@/lib/utils";
import { Button } from "@/components/ui/primitives";
import { photos } from "@/lib/photos";

export const metadata = pageMeta({
  title: "Membership",
  description: "Become an AA Maka Production member for full Sindhi music, exclusive releases and early access.",
  path: "/membership",
});

export default async function MembershipPage() {
  const plans = await prisma.membershipPlan.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div className="mx-auto max-w-page px-4 py-16 md:px-6">
      <div
        className="mb-10 h-52 overflow-hidden rounded-3xl bg-cover bg-center md:h-64"
        style={{ backgroundImage: `url(${photos.concert})` }}
      />
      <p className="text-xs uppercase tracking-[0.28em] text-ajrak">Membership</p>
      <h1 className="mt-3 max-w-3xl font-display text-5xl md:text-6xl">
        Unlock the full song. Keep the culture close.
      </h1>
      <p className="mt-4 max-w-2xl text-ink/70">
        Members hear complete recordings, exclusive studio work and early-access releases. Visitors still
        get a generous preview.
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
