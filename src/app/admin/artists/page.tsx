import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { toSlug } from "@/lib/utils";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { ImageFields } from "@/components/admin/ImageFields";
import { imageFromForm } from "@/lib/admin-images";
import { revalidatePath } from "next/cache";

export default async function AdminArtistsPage() {
  await requirePermission("music.manage");
  const artists = await prisma.artist.findMany({ orderBy: { name: "asc" } });

  async function create(form: FormData) {
    "use server";
    await requirePermission("music.manage");
    const name = String(form.get("name"));
    const photoUrl = await imageFromForm(form, "photoFile", "photoUrl");
    const coverUrl = await imageFromForm(form, "coverFile", "coverUrl", photoUrl);
    await prisma.artist.create({
      data: {
        name,
        slug: toSlug(name),
        nameSd: String(form.get("nameSd") || "") || null,
        biography: String(form.get("biography") || ""),
        photoUrl,
        coverUrl,
        featured: form.get("featured") === "on",
        published: true,
      },
    });
    revalidatePath("/admin/artists");
    revalidatePath("/artists");
    revalidatePath("/");
  }

  async function update(form: FormData) {
    "use server";
    await requirePermission("music.manage");
    const id = String(form.get("id"));
    const artist = await prisma.artist.findUnique({ where: { id } });
    if (!artist) return;
    if (form.get("action") === "delete") {
      await prisma.artist.update({ where: { id }, data: { published: false } });
    } else {
      const photoUrl = await imageFromForm(form, "photoFile", "photoUrl", artist.photoUrl);
      const coverUrl = await imageFromForm(form, "coverFile", "coverUrl", artist.coverUrl);
      await prisma.artist.update({
        where: { id },
        data: {
          name: String(form.get("name")),
          nameSd: String(form.get("nameSd") || "") || null,
          biography: String(form.get("biography") || ""),
          photoUrl,
          coverUrl,
          featured: form.get("featured") === "on",
          published: form.get("published") === "on",
        },
      });
    }
    revalidatePath("/admin/artists");
    revalidatePath("/artists");
    revalidatePath(`/music/artist/${artist.slug}`);
    revalidatePath("/");
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Artists</h1>
      <p className="mt-2 text-sm text-ink/60">
        Change Muhammad Qasim Maka, Ahsan Qasim Maka and every other artist picture, name and description here. Upload a file or paste an image URL, then save.
      </p>
      <form action={create} className="mt-6 space-y-3 rounded-3xl bg-white p-5">
        <h2 className="font-display text-2xl">Add artist</h2>
        <Field label="Name"><input name="name" required className={inputClass} /></Field>
        <Field label="Sindhi name"><input name="nameSd" className={inputClass} /></Field>
        <Field label="Biography"><textarea name="biography" className={inputClass} /></Field>
        <ImageFields label="Photo" urlName="photoUrl" fileName="photoFile" />
        <ImageFields label="Cover" urlName="coverUrl" fileName="coverFile" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" /> Featured</label>
        <Button type="submit">Add artist</Button>
      </form>
      <ul className="mt-6 space-y-4">
        {artists.map((a) => (
          <li key={a.id} className="rounded-3xl bg-white p-5">
            <form action={update} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={a.id} />
              <div className="md:col-span-2 flex items-center gap-4">
                <div
                  className="h-20 w-20 shrink-0 rounded-2xl bg-ink/10 bg-cover bg-center"
                  style={{ backgroundImage: a.photoUrl ? `url(${a.photoUrl})` : undefined }}
                />
                <div>
                  <h2 className="font-display text-2xl">{a.name}</h2>
                  <p className="text-sm text-ink/50">{a.slug}</p>
                </div>
              </div>
              <Field label="Name"><input name="name" defaultValue={a.name} className={inputClass} /></Field>
              <Field label="Sindhi name"><input name="nameSd" defaultValue={a.nameSd ?? ""} className={inputClass} /></Field>
              <div className="md:col-span-2">
                <Field label="Biography"><textarea name="biography" defaultValue={a.biography ?? ""} className={inputClass} /></Field>
              </div>
              <ImageFields label="Photo" urlName="photoUrl" fileName="photoFile" url={a.photoUrl} />
              <ImageFields label="Cover" urlName="coverUrl" fileName="coverFile" url={a.coverUrl} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={a.published} /> Published</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={a.featured} /> Featured</label>
              <div className="flex gap-3 md:col-span-2">
                <Button type="submit">Save {a.name}</Button>
                <button name="action" value="delete" className="text-sm text-ajrak">Hide artist</button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
