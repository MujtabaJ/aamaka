import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { formatMoney } from "@/lib/money";
import { RowActions } from "@/components/admin/RowActions";
import { deleteAlbum } from "@/app/admin/entity-actions";

export default async function AdminAlbumsPage() {
  await requirePermission("music.manage");
  const albums = await prisma.album.findMany({ include: { artist: true }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Albums</h1>
        <Link href="/admin/albums/new" className="rounded-full bg-ajrak px-4 py-2 text-sm text-cream">Add album</Link>
      </div>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="text-ink/50"><th className="py-2">Cover</th><th>Title</th><th>Artist</th><th>Price</th><th className="text-right">Actions</th></tr>
        </thead>
        <tbody>
          {albums.map((album) => (
            <tr key={album.id} className="border-t border-ink/10">
              <td className="py-3">
                <div className="h-14 w-14 rounded-2xl bg-ink/10 bg-cover bg-center" style={{ backgroundImage: album.coverUrl ? `url(${album.coverUrl})` : undefined }} />
              </td>
              <td>{album.title}</td>
              <td>{album.artist?.name}</td>
              <td>{formatMoney(album.pricePaisa)}</td>
              <td><RowActions editHref={`/admin/albums/${album.id}`} deleteAction={deleteAlbum} id={album.id} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
