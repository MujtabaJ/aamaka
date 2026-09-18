import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { formatMoney } from "@/lib/money";

export default async function AdminOrdersPage() {
  await requirePermission("orders.manage");
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div>
      <h1 className="font-display text-4xl">Orders</h1>
      <table className="mt-6 w-full text-left text-sm">
        <thead><tr className="text-ink/50"><th className="py-2">Number</th><th>Email</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-ink/10">
              <td className="py-3"><Link href={`/admin/orders/${o.id}`}>{o.number}</Link></td>
              <td>{o.email}</td>
              <td>{formatMoney(o.totalPaisa)}</td>
              <td>{o.status} / {o.paymentStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
