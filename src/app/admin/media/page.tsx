import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

export default async function AdminMediaPage() {
  await requirePermission("media.manage");
  const media = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 80 });
  return (
    <div>
      <h1 className="font-display text-4xl">Media library</h1>
      <p className="mt-2 text-sm text-ink/60">Private full tracks are stored outside the public folder and served through signed URLs.</p>
      <ul className="mt-6 space-y-2 text-sm">
        {media.map((m) => (
          <li key={m.id} className="rounded-2xl bg-white p-4">
            {m.filename} · {m.kind} · {m.visibility} · {(m.sizeBytes / 1024).toFixed(0)} KB
          </li>
        ))}
      </ul>
    </div>
  );
}
