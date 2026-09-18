import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { formatMoney } from "@/lib/money";

export default async function AdminAnalyticsPage() {
  await requirePermission("analytics.read");
  const [songs, products, orders] = await Promise.all([
    prisma.song.findMany({ orderBy: { playCount: "desc" }, take: 8, include: { artist: true } }),
    prisma.orderItem.groupBy({
      by: ["title"],
      _sum: { totalPaisa: true, quantity: true },
      orderBy: { _sum: { totalPaisa: "desc" } },
      take: 8,
    }),
    prisma.order.aggregate({ _avg: { totalPaisa: true }, _sum: { totalPaisa: true }, where: { paymentStatus: "paid" } }),
  ]);
  return (
    <div>
      <h1 className="font-display text-4xl">Analytics</h1>
      <p className="mt-2 text-sm text-ink/60">
        First-party catalogue analytics. Set NEXT_PUBLIC_GA_MEASUREMENT_ID or NEXT_PUBLIC_META_PIXEL_ID
        to load Google Analytics or Meta Pixel without rewriting the app.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-5">
          <h2 className="font-display text-2xl">Most played songs</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {songs.map((s) => (
              <li key={s.id} className="flex justify-between">
                <span>{s.title}</span>
                <span>{s.playCount} plays</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl bg-white p-5">
          <h2 className="font-display text-2xl">Top order lines</h2>
          <p className="text-sm text-ink/60">Average paid order {formatMoney(Math.round(orders._avg.totalPaisa ?? 0))}</p>
          <ul className="mt-3 space-y-2 text-sm">
            {products.map((p) => (
              <li key={p.title} className="flex justify-between">
                <span>{p.title}</span>
                <span>{formatMoney(p._sum.totalPaisa ?? 0)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
