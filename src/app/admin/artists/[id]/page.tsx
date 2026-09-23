import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { deleteArtist, saveArtist } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";
import { DeleteButton } from "@/components/admin/RowActions";

export default async function EditArtistPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("music.manage");
  const { id } = await params;
  const artist = await prisma.artist.findUnique({ where: { id } });
  if (!artist) notFound();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/artists" className="text-sm text-ajrak">Back to artists</Link>
      <h1 className="mt-3 font-display text-4xl">Edit {artist.name}</h1>
      <form action={saveArtist} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <input type="hidden" name="id" value={artist.id} />
        <PicturePicker spec="artistPhoto" label="Artist picture" fileName="photoFile" urlName="photoUrl" current={artist.photoUrl} />
        <PicturePicker spec="artistCover" label="Cover picture" fileName="coverFile" urlName="coverUrl" current={artist.coverUrl} />
        <Field label="Name"><input name="name" defaultValue={artist.name} required className={inputClass} /></Field>
        <Field label="Sindhi name"><input name="nameSd" defaultValue={artist.nameSd ?? ""} className={inputClass} /></Field>
        <Field label="Biography"><textarea name="biography" rows={5} defaultValue={artist.biography ?? ""} className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={artist.published} /> Published</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={artist.featured} /> Featured</label>
        <Button type="submit">Save changes</Button>
      </form>
      <div className="mt-4">
        <DeleteButton action={deleteArtist} id={artist.id} label="Delete artist" />
      </div>
    </div>
  );
}
