import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { deleteSong, saveSong } from "@/app/admin/actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";

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
      <h1 className="font-display text-4xl">Edit song</h1>
      <form action={saveSong} className="mt-8 space-y-4 rounded-3xl bg-white p-6">
        <input type="hidden" name="id" value={song.id} />
        <Field label="Title"><input name="title" defaultValue={song.title} className={inputClass} /></Field>
        <Field label="Sindhi title"><input name="titleSd" defaultValue={song.titleSd ?? ""} className={inputClass} /></Field>
        <Field label="Short description"><textarea name="shortDescription" defaultValue={song.shortDescription ?? ""} className={inputClass} /></Field>
        <Field label="Cover image URL"><input name="coverUrl" defaultValue={song.coverUrl ?? ""} className={inputClass} /></Field>
        <Field label="Artist">
          <select name="artistId" defaultValue={song.artistId} className={inputClass}>
            {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>
        <Field label="Genre">
          <select name="genreId" defaultValue={song.genreId ?? ""} className={inputClass}>
            <option value="">None</option>
            {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </Field>
        <Field label="Album">
          <select name="albumId" defaultValue={song.albumId ?? ""} className={inputClass}>
            <option value="">None</option>
            {albums.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </Field>
        <Field label="Replace cover"><input name="cover" type="file" accept="image/*" /></Field>
        <Field label="Replace preview"><input name="preview" type="file" accept="audio/*" /></Field>
        <Field label="Replace full audio"><input name="audio" type="file" accept="audio/*" /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={song.featured} /> Featured</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={song.published} /> Published</label>
        <Button type="submit">Save</Button>
      </form>
      <form action={deleteSong} className="mt-4">
        <input type="hidden" name="id" value={song.id} />
        <button className="text-sm text-ajrak">Hide this song</button>
      </form>
    </div>
  );
}
