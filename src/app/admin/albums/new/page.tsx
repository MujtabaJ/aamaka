import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { saveAlbum } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";
import Link from "next/link";

export default async function NewAlbumPage() {
  await requirePermission("music.manage");
  const artists = await prisma.artist.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="max-w-3xl">
      <Link href="/admin/albums" className="text-sm text-ajrak">Back to albums</Link>
      <h1 className="mt-3 font-display text-4xl">Add album</h1>
      <form action={saveAlbum} encType="multipart/form-data" className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <PicturePicker spec="album" label="Album cover" fileName="coverFile" urlName="coverUrl" />
        <Field label="Title"><input name="title" required className={inputClass} /></Field>
        <Field label="Artist">
          <select name="artistId" className={inputClass}>
            {artists.map((artist) => <option key={artist.id} value={artist.id}>{artist.name}</option>)}
          </select>
        </Field>
        <Field label="Price (PKR)"><input name="price" type="number" className={inputClass} /></Field>
        <Field label="Description"><textarea name="description" className={inputClass} /></Field>
        <Button type="submit">Save album</Button>
      </form>
    </div>
  );
}
