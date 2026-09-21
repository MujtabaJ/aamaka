import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { RowActions } from "@/components/admin/RowActions";
import { deleteCoupon } from "@/app/admin/entity-actions";

export default async function AdminCouponsPage() {
  await requirePermission("coupons.manage");
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Coupons</h1>
        <Link href="/admin/coupons/new" className="rounded-full bg-ajrak px-4 py-2 text-sm text-cream">Add coupon</Link>
      </div>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="text-ink/50"><th className="py-2">Code</th><th>Type</th><th>Value</th><th>Status</th><th className="text-right">Actions</th></tr>
        </thead>
        <tbody>
          {coupons.map((coupon) => (
            <tr key={coupon.id} className="border-t border-ink/10">
              <td className="py-3">{coupon.code}</td>
              <td>{coupon.type}</td>
              <td>{coupon.value}</td>
              <td>{coupon.active ? "Active" : "Off"}</td>
              <td><RowActions editHref={`/admin/coupons/${coupon.id}`} deleteAction={deleteCoupon} id={coupon.id} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
