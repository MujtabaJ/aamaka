import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { savePlan } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";

export default async function NewPlanPage() {
  await requirePermission("memberships.manage");
  return (
    <div className="max-w-3xl">
      <Link href="/admin/memberships" className="text-sm text-ajrak">Back to memberships</Link>
      <h1 className="mt-3 font-display text-4xl">Add membership plan</h1>
      <form action={savePlan} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
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
        <Field label="Description"><textarea name="description" className={inputClass} /></Field>
        <Button type="submit">Save plan</Button>
      </form>
    </div>
  );
}
