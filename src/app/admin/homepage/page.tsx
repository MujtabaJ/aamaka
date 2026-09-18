import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { revalidatePath } from "next/cache";

export default async function AdminHomepagePage() {
  await requirePermission("content.manage");
  const [heroes, announcements, pages] = await Promise.all([
    prisma.homepageHero.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.announcement.findMany(),
    prisma.sitePage.findMany(),
  ]);
  async function saveHero(form: FormData) {
    "use server";
    await requirePermission("content.manage");
    const id = String(form.get("id") || "");
    const data = {
      kicker: String(form.get("kicker") || ""),
      title: String(form.get("title") || ""),
      subtitle: String(form.get("subtitle") || ""),
      imageUrl: String(form.get("imageUrl") || "/media/covers/hero.svg"),
      ctaPrimaryLabel: String(form.get("ctaPrimaryLabel") || "Listen Now"),
      ctaPrimaryHref: String(form.get("ctaPrimaryHref") || "/music"),
      ctaSecondaryLabel: String(form.get("ctaSecondaryLabel") || "Explore Music"),
      ctaSecondaryHref: String(form.get("ctaSecondaryHref") || "/music"),
      ctaTertiaryLabel: "Become a Member",
      ctaTertiaryHref: "/membership",
      ctaQuaternaryLabel: "Shop Sindhi Culture",
      ctaQuaternaryHref: "/shop",
      active: true,
    };
    if (id) await prisma.homepageHero.update({ where: { id }, data });
    else await prisma.homepageHero.create({ data });
    revalidatePath("/admin/homepage");
    revalidatePath("/");
  }
  async function savePage(form: FormData) {
    "use server";
    await requirePermission("content.manage");
    const slug = String(form.get("slug"));
    await prisma.sitePage.upsert({
      where: { slug },
      update: { title: String(form.get("title")), body: String(form.get("body")) },
      create: { slug, title: String(form.get("title")), body: String(form.get("body")) },
    });
    revalidatePath("/admin/homepage");
  }
  const hero = heroes[0];
  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="font-display text-4xl">Homepage & pages</h1>
      <form action={saveHero} className="space-y-3 rounded-3xl bg-white p-5">
        {hero ? <input type="hidden" name="id" value={hero.id} /> : null}
        <Field label="Kicker"><input name="kicker" defaultValue={hero?.kicker} className={inputClass} /></Field>
        <Field label="Title"><input name="title" defaultValue={hero?.title} className={inputClass} /></Field>
        <Field label="Subtitle"><textarea name="subtitle" defaultValue={hero?.subtitle} className={inputClass} /></Field>
        <Field label="Image URL"><input name="imageUrl" defaultValue={hero?.imageUrl} className={inputClass} /></Field>
        <Button type="submit">Save hero</Button>
      </form>
      <form action={savePage} className="space-y-3 rounded-3xl bg-white p-5">
        <Field label="Page slug"><input name="slug" placeholder="about" className={inputClass} /></Field>
        <Field label="Title"><input name="title" className={inputClass} /></Field>
        <Field label="Body"><textarea name="body" rows={8} className={inputClass} /></Field>
        <Button type="submit">Save page</Button>
      </form>
      <ul className="text-sm">
        {pages.map((p) => <li key={p.id}>{p.slug} — {p.title}</li>)}
        {announcements.map((a) => <li key={a.id}>Announcement: {a.message}</li>)}
      </ul>
    </div>
  );
}
