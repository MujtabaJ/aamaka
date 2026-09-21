import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { deletePlan, savePlan } from "@/app/admin/entity-actions";
import { paisaToRupees } from "@/lib/money";
import { parseJson } from "@/lib/utils";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { DeleteButton } from "@/components/admin/RowActions";

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("memberships.manage");
  const { id } = await params;
  const plan = await prisma.membershipPlan.findUnique({ where: { id } });
  if (!plan) notFound();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/memberships" className="text-sm text-ajrak">Back to memberships</Link>
      <h1 className="mt-3 font-display text-4xl">Edit {plan.name}</h1>
      <form action={savePlan} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <input type="hidden" name="id" value={plan.id} />
        <Field label="Name"><input name="name" defaultValue={plan.name} required className={inputClass} /></Field>
        <Field label="Interval">
          <select name="interval" defaultValue={plan.interval} className={inputClass}>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        </Field>
        <Field label="Price (PKR)"><input name="price" type="number" defaultValue={paisaToRupees(plan.pricePaisa)} className={inputClass} /></Field>
        <Field label="Trial days"><input name="trialDays" type="number" defaultValue={plan.trialDays} className={inputClass} /></Field>
        <Field label="Features (one per line)"><textarea name="features" defaultValue={parseJson<string[]>(plan.features, []).join("\n")} className={inputClass} /></Field>
        <Field label="Description"><textarea name="description" defaultValue={plan.description} className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={plan.active} /> Active</label>
        <Button type="submit">Save changes</Button>
      </form>
      <div className="mt-4"><DeleteButton action={deletePlan} id={plan.id} label="Delete plan" /></div>
    </div>
  );
}
