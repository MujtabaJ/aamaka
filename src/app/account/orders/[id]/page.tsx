import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { parseJson } from "@/lib/utils";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { items: true },
  });
  if (!order) notFound();
  const address = parseJson<Record<string, string>>(order.shippingSnapshot, {});
  return (
    <div>
      <h1 className="font-display text-4xl">{order.number}</h1>
      <p className="mt-2 text-sm text-ink/60">
        Status: {order.status} · Payment: {order.paymentStatus} ({order.paymentMethod})
      </p>
      <ul className="mt-6 space-y-2 rounded-3xl bg-white p-5">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm">
            <span>
              {item.title} × {item.quantity}
            </span>
            <span>{formatMoney(item.totalPaisa)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xl">{formatMoney(order.totalPaisa)}</p>
      {address.line1 ? (
        <p className="mt-4 text-sm text-ink/70">
          {address.fullName}, {address.line1}, {address.city}
        </p>
      ) : null}
    </div>
  );
}
