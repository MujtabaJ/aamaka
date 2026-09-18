import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

export default async function AdminMusicPage() {
  await requirePermission("music.manage");
  const songs = await prisma.song.findMany({
    include: { artist: true, genre: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Music</h1>
        <Link href="/admin/music/new" className="rounded-full bg-ajrak px-4 py-2 text-sm text-cream">
          Add song
        </Link>
      </div>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="text-ink/50">
            <th className="py-2">Title</th>
            <th>Artist</th>
            <th>Access</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((s) => (
            <tr key={s.id} className="border-t border-ink/10">
              <td className="py-3">
                <Link href={`/admin/music/${s.id}`}>{s.title}</Link>
              </td>
              <td>{s.artist.name}</td>
              <td>{s.accessType}</td>
              <td>{s.published ? "Published" : "Draft"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
