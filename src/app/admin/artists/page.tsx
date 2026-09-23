import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { RowActions } from "@/components/admin/RowActions";
import { AdminThumb } from "@/components/admin/AdminThumb";
import { deleteArtist } from "@/app/admin/entity-actions";

export default async function AdminArtistsPage() {
  await requirePermission("music.manage");
  const artists = await prisma.artist.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">Artists</h1>
          <p className="mt-2 text-sm text-ink/60">Edit or delete an artist from the end of each row. Use Change picture on the edit screen to replace their photo.</p>
        </div>
        <Link href="/admin/artists/new" className="rounded-full bg-ajrak px-4 py-2 text-sm text-cream">Add artist</Link>
      </div>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="text-ink/50">
            <th className="py-2">Picture</th>
            <th>Name</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {artists.map((artist) => (
            <tr key={artist.id} className="border-t border-ink/10">
              <td className="py-3">
                <AdminThumb src={artist.photoUrl} spec="artistPhoto" />
              </td>
              <td>
                <p className="font-medium">{artist.name}</p>
                {artist.nameSd ? <p className="text-ink/50">{artist.nameSd}</p> : null}
              </td>
              <td>{artist.published ? "Published" : "Hidden"}</td>
              <td><RowActions editHref={`/admin/artists/${artist.id}`} deleteAction={deleteArtist} id={artist.id} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
