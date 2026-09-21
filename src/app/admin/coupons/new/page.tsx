import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { saveCoupon } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";

export default async function NewCouponPage() {
  await requirePermission("coupons.manage");
  return (
    <div className="max-w-3xl">
      <Link href="/admin/coupons" className="text-sm text-ajrak">Back to coupons</Link>
      <h1 className="mt-3 font-display text-4xl">Add coupon</h1>
      <form action={saveCoupon} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <Field label="Code"><input name="code" required className={inputClass} /></Field>
        <Field label="Type">
          <select name="type" className={inputClass}>
            <option value="percent">Percent</option>
            <option value="fixed">Fixed (PKR)</option>
          </select>
        </Field>
        <Field label="Value"><input name="value" type="number" required className={inputClass} /></Field>
        <Field label="Min order (PKR)"><input name="minOrder" type="number" className={inputClass} /></Field>
        <Field label="Usage limit"><input name="usageLimit" type="number" className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="memberOnly" /> Member only</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="firstOrderOnly" /> First order</label>
        <Button type="submit">Save coupon</Button>
      </form>
    </div>
  );
}
