import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { formatMoney } from "@/lib/money";
import { startOfDay, startOfMonth } from "date-fns";
import Link from "next/link";

export default async function AdminHome() {
  await requirePermission("dashboard.read");
  const today = startOfDay(new Date());
  const month = startOfMonth(new Date());
  const paid = { paymentStatus: "paid" as const };

  const [
    totalSales,
    todaySales,
    monthSales,
    orders,
    pending,
    completed,
    cancelled,
    members,
    newMembers,
    albumItems,
    productItems,
    lowStock,
    latestOrders,
    latestSubs,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalPaisa: true }, where: paid }),
    prisma.order.aggregate({ _sum: { totalPaisa: true }, where: { ...paid, createdAt: { gte: today } } }),
    prisma.order.aggregate({ _sum: { totalPaisa: true }, where: { ...paid, createdAt: { gte: month } } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["pending", "payment_pending"] } } }),
    prisma.order.count({ where: { status: "delivered" } }),
    prisma.order.count({ where: { status: "cancelled" } }),
    prisma.subscription.count({ where: { status: { in: ["active", "trial"] } } }),
    prisma.subscription.count({ where: { createdAt: { gte: month } } }),
    prisma.orderItem.aggregate({ _sum: { totalPaisa: true }, where: { kind: "album" } }),
    prisma.orderItem.aggregate({ _sum: { totalPaisa: true }, where: { kind: "product" } }),
    prisma.product.findMany({ where: { status: "published" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.subscription.findMany({ include: { user: true, plan: true }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const low = lowStock.filter((p) => p.stock <= p.lowStockAt);
  const cards = [
    ["Total sales", formatMoney(totalSales._sum.totalPaisa ?? 0)],
    ["Today", formatMoney(todaySales._sum.totalPaisa ?? 0)],
    ["This month", formatMoney(monthSales._sum.totalPaisa ?? 0)],
    ["Orders", String(orders)],
    ["Pending", String(pending)],
    ["Delivered", String(completed)],
    ["Cancelled", String(cancelled)],
    ["Active members", String(members)],
    ["New members", String(newMembers)],
    ["Album sales", formatMoney(albumItems._sum.totalPaisa ?? 0)],
    ["Product sales", formatMoney(productItems._sum.totalPaisa ?? 0)],
    ["Low stock", String(low.length)],
  ];

  return (
    <div>
      <h1 className="font-display text-4xl">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white p-4 shadow-soft">
            <p className="text-xs uppercase tracking-[0.16em] text-ink/50">{label}</p>
            <p className="mt-2 font-display text-3xl">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-5">
          <h2 className="font-display text-2xl">Latest orders</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {latestOrders.map((o) => (
              <li key={o.id} className="flex justify-between">
                <Link href={`/admin/orders/${o.id}`}>{o.number}</Link>
                <span>
                  {formatMoney(o.totalPaisa)} · {o.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl bg-white p-5">
          <h2 className="font-display text-2xl">Recent subscriptions</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {latestSubs.map((s) => (
              <li key={s.id}>
                {s.user.name} · {s.plan.name} · {s.status}
              </li>
            ))}
          </ul>
          {low.length ? (
            <div className="mt-6">
              <h3 className="text-sm font-medium">Low stock</h3>
              {low.map((p) => (
                <p key={p.id} className="text-sm text-ajrak">
                  {p.name} ({p.stock})
                </p>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
