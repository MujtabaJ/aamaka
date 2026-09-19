import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { toSlug } from "@/lib/utils";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { revalidatePath } from "next/cache";

export default async function AdminArtistsPage() {
  await requirePermission("music.manage");
  const artists = await prisma.artist.findMany({ orderBy: { name: "asc" } });

  async function create(form: FormData) {
    "use server";
    await requirePermission("music.manage");
    const name = String(form.get("name"));
    await prisma.artist.create({
      data: {
        name,
        slug: toSlug(name),
        nameSd: String(form.get("nameSd") || "") || null,
        biography: String(form.get("biography") || ""),
        photoUrl: String(form.get("photoUrl") || "") || null,
        coverUrl: String(form.get("coverUrl") || "") || null,
        featured: form.get("featured") === "on",
        published: true,
      },
    });
    revalidatePath("/admin/artists");
    revalidatePath("/artists");
  }

  async function update(form: FormData) {
    "use server";
    await requirePermission("music.manage");
    const id = String(form.get("id"));
    if (form.get("action") === "delete") {
      await prisma.artist.update({ where: { id }, data: { published: false } });
    } else {
      await prisma.artist.update({
        where: { id },
        data: {
          name: String(form.get("name")),
          nameSd: String(form.get("nameSd") || "") || null,
          biography: String(form.get("biography") || ""),
          photoUrl: String(form.get("photoUrl") || "") || null,
          coverUrl: String(form.get("coverUrl") || "") || null,
          featured: form.get("featured") === "on",
          published: form.get("published") === "on",
        },
      });
    }
    revalidatePath("/admin/artists");
    revalidatePath("/artists");
    revalidatePath("/");
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Artists</h1>
      <form action={create} className="mt-6 space-y-3 rounded-3xl bg-white p-5">
        <Field label="Name"><input name="name" required className={inputClass} /></Field>
        <Field label="Sindhi name"><input name="nameSd" className={inputClass} /></Field>
        <Field label="Biography"><textarea name="biography" className={inputClass} /></Field>
        <Field label="Photo URL"><input name="photoUrl" className={inputClass} /></Field>
        <Field label="Cover URL"><input name="coverUrl" className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" /> Featured</label>
        <Button type="submit">Add artist</Button>
      </form>
      <ul className="mt-6 space-y-3">
        {artists.map((a) => (
          <li key={a.id} className="rounded-2xl bg-white p-4">
            <form action={update} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={a.id} />
              <Field label="Name"><input name="name" defaultValue={a.name} className={inputClass} /></Field>
              <Field label="Sindhi name"><input name="nameSd" defaultValue={a.nameSd ?? ""} className={inputClass} /></Field>
              <div className="md:col-span-2">
                <Field label="Biography"><textarea name="biography" defaultValue={a.biography ?? ""} className={inputClass} /></Field>
              </div>
              <Field label="Photo URL"><input name="photoUrl" defaultValue={a.photoUrl ?? ""} className={inputClass} /></Field>
              <Field label="Cover URL"><input name="coverUrl" defaultValue={a.coverUrl ?? ""} className={inputClass} /></Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={a.published} /> Published</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={a.featured} /> Featured</label>
              <div className="flex gap-3 md:col-span-2">
                <Button type="submit">Save</Button>
                <button name="action" value="delete" className="text-sm text-ajrak">Hide artist</button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
