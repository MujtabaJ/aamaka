import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { deleteSong, saveSong } from "@/app/admin/actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";
import { DeleteButton } from "@/components/admin/RowActions";

export default async function EditSongPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("music.manage");
  const { id } = await params;
  const song = await prisma.song.findUnique({ where: { id } });
  if (!song) notFound();
  const [artists, genres, albums] = await Promise.all([
    prisma.artist.findMany(),
    prisma.genre.findMany(),
    prisma.album.findMany(),
  ]);
  return (
    <div className="max-w-3xl">
      <Link href="/admin/music" className="text-sm text-ajrak">Back to music</Link>
      <h1 className="mt-3 font-display text-4xl">Edit {song.title}</h1>
      <form action={saveSong} encType="multipart/form-data" className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <input type="hidden" name="id" value={song.id} />
        <PicturePicker spec="song" label="Cover picture" fileName="coverFile" urlName="coverUrl" current={song.coverUrl} />
        <Field label="Title"><input name="title" defaultValue={song.title} className={inputClass} /></Field>
        <Field label="Sindhi title"><input name="titleSd" defaultValue={song.titleSd ?? ""} className={inputClass} /></Field>
        <Field label="Short description"><textarea name="shortDescription" defaultValue={song.shortDescription ?? ""} className={inputClass} /></Field>
        <Field label="Artist">
          <select name="artistId" defaultValue={song.artistId} className={inputClass}>
            {artists.map((artist) => <option key={artist.id} value={artist.id}>{artist.name}</option>)}
          </select>
        </Field>
        <Field label="Genre">
          <select name="genreId" defaultValue={song.genreId ?? ""} className={inputClass}>
            <option value="">None</option>
            {genres.map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
          </select>
        </Field>
        <Field label="Album">
          <select name="albumId" defaultValue={song.albumId ?? ""} className={inputClass}>
            <option value="">None</option>
            {albums.map((album) => <option key={album.id} value={album.id}>{album.title}</option>)}
          </select>
        </Field>
        <Field label="Replace preview"><input name="preview" type="file" accept="audio/*" /></Field>
        <Field label="Replace full audio"><input name="audio" type="file" accept="audio/*" /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={song.featured} /> Featured</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={song.published} /> Published</label>
        <Button type="submit">Save changes</Button>
      </form>
      <div className="mt-4"><DeleteButton action={deleteSong} id={song.id} label="Delete song" /></div>
    </div>
  );
}
