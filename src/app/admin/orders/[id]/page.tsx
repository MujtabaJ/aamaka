import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { updateOrderStatus } from "@/app/admin/actions";
import { formatMoney } from "@/lib/money";
import { parseJson } from "@/lib/utils";
import { Field, inputClass, Button } from "@/components/ui/primitives";

const statuses = ["pending","payment_pending","paid","confirmed","processing","packed","shipped","delivered","cancelled","refunded","failed"];

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("orders.manage");
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true, payments: true } });
  if (!order) notFound();
  const address = parseJson<Record<string, string>>(order.shippingSnapshot, {});
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-4xl">{order.number}</h1>
      <p className="mt-2 text-sm">{order.email} · {order.phone}</p>
      <ul className="mt-6 rounded-3xl bg-white p-5 text-sm">
        {order.items.map((i) => (
          <li key={i.id} className="flex justify-between py-1"><span>{i.title} × {i.quantity}</span><span>{formatMoney(i.totalPaisa)}</span></li>
        ))}
      </ul>
      <p className="mt-3">Total {formatMoney(order.totalPaisa)} · {order.paymentMethod}</p>
      {address.line1 ? <p className="mt-2 text-sm">{address.fullName}, {address.line1}, {address.city}</p> : null}
      <form action={updateOrderStatus} className="mt-6 space-y-3 rounded-3xl bg-white p-5">
        <input type="hidden" name="id" value={order.id} />
        <Field label="Status">
          <select name="status" defaultValue={order.status} className={inputClass}>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Courier"><input name="courierName" defaultValue={order.courierName ?? ""} className={inputClass} /></Field>
        <Field label="Tracking"><input name="trackingNumber" defaultValue={order.trackingNumber ?? ""} className={inputClass} /></Field>
        <Button type="submit">Update order</Button>
      </form>
    </div>
  );
}
