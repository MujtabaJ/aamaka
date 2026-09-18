import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Orders", description: "Order history", path: "/account/orders" });

const steps = ["pending", "confirmed", "processing", "packed", "shipped", "delivered"];

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="font-display text-4xl">Orders</h1>
      <div className="mt-6 space-y-4">
        {orders.length === 0 ? <p>No orders yet.</p> : null}
        {orders.map((order) => (
          <article key={order.id} className="rounded-3xl bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link href={`/account/orders/${order.id}`} className="font-display text-2xl">
                {order.number}
              </Link>
              <span className="text-sm">{formatMoney(order.totalPaisa)}</span>
            </div>
            <p className="mt-1 text-sm text-ink/60">
              {formatDate(order.createdAt)} · {order.status.replace("_", " ")} · {order.paymentStatus}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.12em]">
              {steps.map((step) => (
                <span key={step} className={order.status === step || steps.indexOf(order.status) > steps.indexOf(step) ? "text-ajrak" : "text-ink/30"}>
                  {step}
                </span>
              ))}
            </div>
            {order.trackingNumber ? (
              <p className="mt-2 text-sm">
                {order.courierName}: {order.trackingNumber}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
