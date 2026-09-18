import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { toSlug } from "@/lib/utils";
import { rupeesToPaisa, formatMoney } from "@/lib/money";
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
        pricePaisa: rupeesToPaisa(Number(form.get("price") || 0)),
        accessType: String(form.get("accessType") || "paid"),
        published: true,
      },
    });
    await audit({ userId: user.id, action: "create", entity: "album", entityId: album.id });
    revalidatePath("/admin/albums");
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
        <Field label="Description"><input name="description" className={inputClass} /></Field>
        <Button type="submit">Create album</Button>
      </form>
      <ul className="mt-6 space-y-2">
        {albums.map((a) => (
          <li key={a.id} className="rounded-2xl bg-white p-4 text-sm">
            {a.title} · {a.artist?.name} · {a.tracks.length} tracks · {formatMoney(a.pricePaisa)}
          </li>
        ))}
      </ul>
    </div>
  );
}
