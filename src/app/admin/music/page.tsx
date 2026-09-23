import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { RowActions } from "@/components/admin/RowActions";
import { AdminThumb } from "@/components/admin/AdminThumb";
import { deleteSong } from "@/app/admin/actions";

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
        <Link href="/admin/music/new" className="rounded-full bg-ajrak px-4 py-2 text-sm text-cream">Add song</Link>
      </div>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="text-ink/50">
            <th className="py-2">Cover</th>
            <th>Title</th>
            <th>Artist</th>
            <th>Access</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song) => (
            <tr key={song.id} className="border-t border-ink/10">
              <td className="py-3">
                <AdminThumb src={song.coverUrl} spec="song" />
              </td>
              <td>{song.title}</td>
              <td>{song.artist.name}</td>
              <td>{song.accessType}</td>
              <td>{song.published ? "Published" : "Draft"}</td>
              <td><RowActions editHref={`/admin/music/${song.id}`} deleteAction={deleteSong} id={song.id} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
