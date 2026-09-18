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
    const name = String(form.get("name"));
    await prisma.artist.create({
      data: {
        name,
        slug: toSlug(name),
        nameSd: String(form.get("nameSd") || "") || null,
        biography: String(form.get("biography") || ""),
        featured: form.get("featured") === "on",
        published: true,
      },
    });
    revalidatePath("/admin/artists");
  }
  return (
    <div>
      <h1 className="font-display text-4xl">Artists</h1>
      <form action={create} className="mt-6 space-y-3 rounded-3xl bg-white p-5">
        <Field label="Name"><input name="name" required className={inputClass} /></Field>
        <Field label="Sindhi name"><input name="nameSd" className={inputClass} /></Field>
        <Field label="Biography"><textarea name="biography" className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" /> Featured</label>
        <Button type="submit">Add artist</Button>
      </form>
      <ul className="mt-6 space-y-2">
        {artists.map((a) => (
          <li key={a.id} className="rounded-2xl bg-white p-4">{a.name}</li>
        ))}
      </ul>
    </div>
  );
}
