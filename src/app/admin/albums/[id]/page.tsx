import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { deleteAlbum, saveAlbum } from "@/app/admin/entity-actions";
import { paisaToRupees } from "@/lib/money";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";
import { DeleteButton } from "@/components/admin/RowActions";

export default async function EditAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("music.manage");
  const { id } = await params;
  const album = await prisma.album.findUnique({ where: { id } });
  if (!album) notFound();
  const artists = await prisma.artist.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="max-w-3xl">
      <Link href="/admin/albums" className="text-sm text-ajrak">Back to albums</Link>
      <h1 className="mt-3 font-display text-4xl">Edit {album.title}</h1>
      <form action={saveAlbum} encType="multipart/form-data" className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <input type="hidden" name="id" value={album.id} />
        <PicturePicker spec="album" label="Album cover" fileName="coverFile" urlName="coverUrl" current={album.coverUrl} />
        <Field label="Title"><input name="title" defaultValue={album.title} required className={inputClass} /></Field>
        <Field label="Artist">
          <select name="artistId" defaultValue={album.artistId ?? ""} className={inputClass}>
            {artists.map((artist) => <option key={artist.id} value={artist.id}>{artist.name}</option>)}
          </select>
        </Field>
        <Field label="Price (PKR)"><input name="price" type="number" defaultValue={paisaToRupees(album.pricePaisa)} className={inputClass} /></Field>
        <Field label="Description"><textarea name="description" defaultValue={album.description} className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={album.published} /> Published</label>
        <Button type="submit">Save changes</Button>
      </form>
      <div className="mt-4"><DeleteButton action={deleteAlbum} id={album.id} label="Delete album" /></div>
    </div>
  );
}
