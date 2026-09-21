import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { deleteCoupon, saveCoupon } from "@/app/admin/entity-actions";
import { paisaToRupees } from "@/lib/money";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { DeleteButton } from "@/components/admin/RowActions";

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("coupons.manage");
  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) notFound();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/coupons" className="text-sm text-ajrak">Back to coupons</Link>
      <h1 className="mt-3 font-display text-4xl">Edit {coupon.code}</h1>
      <form action={saveCoupon} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <input type="hidden" name="id" value={coupon.id} />
        <Field label="Code"><input name="code" defaultValue={coupon.code} required className={inputClass} /></Field>
        <Field label="Type">
          <select name="type" defaultValue={coupon.type} className={inputClass}>
            <option value="percent">Percent</option>
            <option value="fixed">Fixed (PKR)</option>
          </select>
        </Field>
        <Field label="Value"><input name="value" type="number" defaultValue={coupon.value} required className={inputClass} /></Field>
        <Field label="Min order (PKR)"><input name="minOrder" type="number" defaultValue={paisaToRupees(coupon.minOrderPaisa)} className={inputClass} /></Field>
        <Field label="Usage limit"><input name="usageLimit" type="number" defaultValue={coupon.usageLimit ?? ""} className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="memberOnly" defaultChecked={coupon.memberOnly} /> Member only</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="firstOrderOnly" defaultChecked={coupon.firstOrderOnly} /> First order</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={coupon.active} /> Active</label>
        <Button type="submit">Save changes</Button>
      </form>
      <div className="mt-4"><DeleteButton action={deleteCoupon} id={coupon.id} label="Delete coupon" /></div>
    </div>
  );
}
