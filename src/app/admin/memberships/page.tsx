import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { formatMoney } from "@/lib/money";
import { RowActions } from "@/components/admin/RowActions";
import { deletePlan } from "@/app/admin/entity-actions";

export default async function AdminMembershipsPage() {
  await requirePermission("memberships.manage");
  const [plans, subscriptions] = await Promise.all([
    prisma.membershipPlan.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.subscription.findMany({ include: { user: true, plan: true }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Memberships</h1>
        <Link href="/admin/memberships/new" className="rounded-full bg-ajrak px-4 py-2 text-sm text-cream">Add plan</Link>
      </div>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="text-ink/50"><th className="py-2">Plan</th><th>Price</th><th>Interval</th><th>Status</th><th className="text-right">Actions</th></tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan.id} className="border-t border-ink/10">
              <td className="py-3">{plan.name}</td>
              <td>{formatMoney(plan.pricePaisa)}</td>
              <td>{plan.interval}</td>
              <td>{plan.active ? "Active" : "Hidden"}</td>
              <td><RowActions editHref={`/admin/memberships/${plan.id}`} deleteAction={deletePlan} id={plan.id} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="mt-10 font-display text-2xl">Subscriptions</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {subscriptions.map((subscription) => (
          <li key={subscription.id} className="rounded-2xl bg-white p-4">
            {subscription.user.email} · {subscription.plan.name} · {subscription.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
