import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { saveSong } from "@/app/admin/actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";

export default async function NewSongPage() {
  await requirePermission("music.manage");
  const [artists, genres, albums] = await Promise.all([
    prisma.artist.findMany({ orderBy: { name: "asc" } }),
    prisma.genre.findMany(),
    prisma.album.findMany({ orderBy: { title: "asc" } }),
  ]);
  return (
    <div className="max-w-3xl">
      <Link href="/admin/music" className="text-sm text-ajrak">Back to music</Link>
      <h1 className="mt-3 font-display text-4xl">Add song</h1>
      <form action={saveSong} className="mt-8 space-y-8">
        <section className="rounded-3xl bg-white p-6">
          <h2 className="font-display text-2xl">Song information</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Title"><input name="title" required className={inputClass} /></Field>
            <Field label="Sindhi title"><input name="titleSd" className={inputClass} /></Field>
            <Field label="English title"><input name="titleEn" className={inputClass} /></Field>
            <Field label="Language"><input name="language" defaultValue="Sindhi" className={inputClass} /></Field>
            <Field label="Artist">
              <select name="artistId" required className={inputClass}>
                {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>
            <Field label="Genre">
              <select name="genreId" className={inputClass}>
                <option value="">None</option>
                {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </Field>
            <Field label="Album">
              <select name="albumId" className={inputClass}>
                <option value="">None</option>
                {albums.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </Field>
            <Field label="Short description"><input name="shortDescription" className={inputClass} /></Field>
          </div>
        </section>
        <section className="rounded-3xl bg-white p-6">
          <h2 className="font-display text-2xl">Media</h2>
          <div className="mt-4 grid gap-4">
            <PicturePicker label="Cover picture" fileName="coverFile" urlName="coverUrl" />
            <Field label="Preview audio"><input name="preview" type="file" accept="audio/*" /></Field>
            <Field label="Full audio"><input name="audio" type="file" accept="audio/*" /></Field>
            <Field label="Video"><input name="video" type="file" accept="video/*" /></Field>
          </div>
        </section>
        <section className="rounded-3xl bg-white p-6">
          <h2 className="font-display text-2xl">Credits, lyrics, rights</h2>
          <div className="mt-4 grid gap-4">
            <Field label="Singer"><input name="singer" className={inputClass} /></Field>
            <Field label="Composer"><input name="composer" className={inputClass} /></Field>
            <Field label="Producer"><input name="producer" className={inputClass} /></Field>
            <Field label="Lyrics"><textarea name="lyrics" rows={6} className={inputClass} /></Field>
            <Field label="Copyright owner"><input name="copyrightOwner" className={inputClass} /></Field>
            <Field label="License / permission notes"><textarea name="licenseInfo" rows={3} className={inputClass} /></Field>
            <Field label="YouTube URL"><input name="youtubeUrl" className={inputClass} /></Field>
          </div>
        </section>
        <section className="rounded-3xl bg-white p-6">
          <h2 className="font-display text-2xl">Access & SEO</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Access">
              <select name="accessType" className={inputClass}>
                <option value="preview">Preview + membership</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="paid">Purchase only</option>
                <option value="early">Early access</option>
                <option value="hidden">Hidden</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="exclusive" /> Exclusive</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="earlyAccess" /> Early access</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked /> Publish</label>
            <Field label="SEO title"><input name="seoTitle" className={inputClass} /></Field>
            <Field label="SEO description"><input name="seoDescription" className={inputClass} /></Field>
          </div>
        </section>
        <Button type="submit" variant="primary">Publish song</Button>
      </form>
    </div>
  );
}
