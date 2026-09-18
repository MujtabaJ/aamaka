import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export default async function AdminNotificationsPage() {
  await requirePermission("notifications.manage");
  const notes = await prisma.notification.findMany({
    where: { audience: "admin" },
    orderBy: { createdAt: "desc" },
    take: 80,
  });
  return (
    <div>
      <h1 className="font-display text-4xl">Notifications</h1>
      <ul className="mt-6 space-y-3">
        {notes.map((n) => (
          <li key={n.id} className="rounded-2xl bg-white p-4">
            <p className="font-medium">{n.title}</p>
            <p className="text-sm text-ink/70">{n.body}</p>
            <p className="text-xs text-ink/40">{formatDate(n.createdAt)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
