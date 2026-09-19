import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { toSlug } from "@/lib/utils";
import { rupeesToPaisa, formatMoney, paisaToRupees } from "@/lib/money";
import { audit } from "@/lib/audit";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { revalidatePath } from "next/cache";

export default async function AdminAlbumsPage() {
  const user = await requirePermission("music.manage");
  const [albums, artists] = await Promise.all([
    prisma.album.findMany({ include: { artist: true, tracks: true }, orderBy: { createdAt: "desc" } }),
    prisma.artist.findMany(),
  ]);

  async function create(form: FormData) {
    "use server";
    const title = String(form.get("title"));
    const album = await prisma.album.create({
      data: {
        title,
        slug: toSlug(title),
        description: String(form.get("description") || ""),
        artistId: String(form.get("artistId") || "") || null,
        coverUrl: String(form.get("coverUrl") || "") || null,
        pricePaisa: rupeesToPaisa(Number(form.get("price") || 0)),
        accessType: String(form.get("accessType") || "paid"),
        published: true,
      },
    });
    await audit({ userId: user.id, action: "create", entity: "album", entityId: album.id });
    revalidatePath("/admin/albums");
    revalidatePath("/albums");
  }

  async function update(form: FormData) {
    "use server";
    await requirePermission("music.manage");
    const id = String(form.get("id"));
    if (form.get("action") === "delete") {
      await prisma.album.update({ where: { id }, data: { published: false } });
    } else {
      await prisma.album.update({
        where: { id },
        data: {
          title: String(form.get("title")),
          description: String(form.get("description") || ""),
          coverUrl: String(form.get("coverUrl") || "") || null,
          pricePaisa: rupeesToPaisa(Number(form.get("price") || 0)),
          published: form.get("published") === "on",
        },
      });
    }
    revalidatePath("/admin/albums");
    revalidatePath("/albums");
    revalidatePath("/");
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Albums</h1>
      <form action={create} className="mt-6 grid gap-3 rounded-3xl bg-white p-5 md:grid-cols-2">
        <Field label="Title"><input name="title" required className={inputClass} /></Field>
        <Field label="Artist">
          <select name="artistId" className={inputClass}>
            {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>
        <Field label="Price (PKR)"><input name="price" type="number" className={inputClass} /></Field>
        <Field label="Cover image URL"><input name="coverUrl" className={inputClass} /></Field>
        <div className="md:col-span-2"><Field label="Description"><input name="description" className={inputClass} /></Field></div>
        <Button type="submit">Create album</Button>
      </form>
      <ul className="mt-6 space-y-3">
        {albums.map((a) => (
          <li key={a.id} className="rounded-2xl bg-white p-4">
            <p className="text-sm text-ink/50">{a.artist?.name} · {a.tracks.length} tracks · {formatMoney(a.pricePaisa)}</p>
            <form action={update} className="mt-3 grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={a.id} />
              <Field label="Title"><input name="title" defaultValue={a.title} className={inputClass} /></Field>
              <Field label="Price (PKR)"><input name="price" type="number" defaultValue={paisaToRupees(a.pricePaisa)} className={inputClass} /></Field>
              <div className="md:col-span-2">
                <Field label="Description"><textarea name="description" defaultValue={a.description ?? ""} className={inputClass} /></Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Cover image URL"><input name="coverUrl" defaultValue={a.coverUrl ?? ""} className={inputClass} /></Field>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={a.published} /> Published</label>
              <div className="flex gap-3">
                <Button type="submit">Save</Button>
                <button name="action" value="delete" className="text-sm text-ajrak">Hide album</button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
