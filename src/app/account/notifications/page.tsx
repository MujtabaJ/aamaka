import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function UserNotificationsPage() {
  const user = await requireUser();
  const notes = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return (
    <div>
      <h1 className="font-display text-4xl">Notifications</h1>
      <ul className="mt-6 space-y-3">
        {notes.map((n) => (
          <li key={n.id} className="rounded-2xl bg-white p-4">
            <p className="font-medium">{n.title}</p>
            <p className="text-sm text-ink/70">{n.body}</p>
            <p className="mt-1 text-xs text-ink/40">{formatDate(n.createdAt)}</p>
          </li>
        ))}
        {notes.length === 0 ? <p>No notifications yet.</p> : null}
      </ul>
    </div>
  );
}
