import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

export default async function AdminCustomersPage() {
  await requirePermission("customers.manage");
  const customers = await prisma.user.findMany({
    where: { role: { name: "CUSTOMER" } },
    include: { subscriptions: true, orders: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="font-display text-4xl">Customers</h1>
      <ul className="mt-6 space-y-2">
        {customers.map((c) => (
          <li key={c.id} className="rounded-2xl bg-white p-4 text-sm">
            {c.name} · {c.email} · {c.orders.length} orders · {c.subscriptions[0]?.status ?? "no membership"}
          </li>
        ))}
      </ul>
    </div>
  );
}
