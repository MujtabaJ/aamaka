import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { toSlug } from "@/lib/utils";
import { rupeesToPaisa, formatMoney } from "@/lib/money";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { revalidatePath } from "next/cache";

export default async function AdminMembershipsPage() {
  await requirePermission("memberships.manage");
  const [plans, subs] = await Promise.all([
    prisma.membershipPlan.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.subscription.findMany({ include: { user: true, plan: true }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  async function create(form: FormData) {
    "use server";
    await requirePermission("memberships.manage");
    const name = String(form.get("name"));
    await prisma.membershipPlan.create({
      data: {
        name,
        slug: toSlug(name),
        description: String(form.get("description") || ""),
        interval: String(form.get("interval") || "monthly"),
        pricePaisa: rupeesToPaisa(Number(form.get("price") || 0)),
        trialDays: Number(form.get("trialDays") || 0),
        features: JSON.stringify(String(form.get("features") || "").split("\n").filter(Boolean)),
        active: true,
      },
    });
    revalidatePath("/admin/memberships");
  }
  return (
    <div>
      <h1 className="font-display text-4xl">Memberships</h1>
      <form action={create} className="mt-6 space-y-3 rounded-3xl bg-white p-5">
        <Field label="Name"><input name="name" required className={inputClass} /></Field>
        <Field label="Interval">
          <select name="interval" className={inputClass}>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        </Field>
        <Field label="Price (PKR)"><input name="price" type="number" className={inputClass} /></Field>
        <Field label="Trial days"><input name="trialDays" type="number" defaultValue={0} className={inputClass} /></Field>
        <Field label="Features (one per line)"><textarea name="features" className={inputClass} /></Field>
        <Field label="Description"><input name="description" className={inputClass} /></Field>
        <Button type="submit">Create plan</Button>
      </form>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {plans.map((p) => (
          <div key={p.id} className="rounded-2xl bg-white p-4">
            <p className="font-display text-2xl">{p.name}</p>
            <p>{formatMoney(p.pricePaisa)} / {p.interval}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-10 font-display text-2xl">Subscriptions</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {subs.map((s) => (
          <li key={s.id} className="rounded-2xl bg-white p-4">{s.user.email} · {s.plan.name} · {s.status}</li>
        ))}
      </ul>
    </div>
  );
}
