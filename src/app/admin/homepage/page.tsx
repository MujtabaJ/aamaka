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
      ctaTertiaryLabel: String(form.get("ctaTertiaryLabel") || "Become a Member"),
      ctaTertiaryHref: String(form.get("ctaTertiaryHref") || "/membership"),
      ctaQuaternaryLabel: String(form.get("ctaQuaternaryLabel") || "Shop Sindhi Culture"),
      ctaQuaternaryHref: String(form.get("ctaQuaternaryHref") || "/shop"),
      active: form.get("active") !== "off",
    };
    if (form.get("action") === "delete" && id) {
      await prisma.homepageHero.delete({ where: { id } });
    } else if (id) {
      await prisma.homepageHero.update({ where: { id }, data });
    } else {
      await prisma.homepageHero.create({ data });
    }
    revalidatePath("/admin/homepage");
    revalidatePath("/");
  }

  async function saveAnnouncement(form: FormData) {
    "use server";
    await requirePermission("content.manage");
    const id = String(form.get("id") || "");
    if (form.get("action") === "delete" && id) {
      await prisma.announcement.delete({ where: { id } });
    } else if (id) {
      await prisma.announcement.update({
        where: { id },
        data: {
          message: String(form.get("message") || ""),
          href: String(form.get("href") || "") || null,
          active: form.get("active") === "on",
        },
      });
    } else {
      await prisma.announcement.create({
        data: {
          message: String(form.get("message") || ""),
          href: String(form.get("href") || "") || null,
          active: true,
        },
      });
    }
    revalidatePath("/admin/homepage");
    revalidatePath("/");
  }

  async function savePage(form: FormData) {
    "use server";
    await requirePermission("content.manage");
    const slug = String(form.get("slug"));
    if (form.get("action") === "delete") {
      await prisma.sitePage.delete({ where: { slug } });
    } else {
      await prisma.sitePage.upsert({
        where: { slug },
        update: { title: String(form.get("title")), body: String(form.get("body")) },
        create: { slug, title: String(form.get("title")), body: String(form.get("body")) },
      });
    }
    revalidatePath("/admin/homepage");
    revalidatePath("/about");
    revalidatePath(`/policies/${slug}`);
  }

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="font-display text-4xl">Homepage & pages</h1>
      <p className="text-sm text-ink/60">
        Change titles, descriptions, pictures and buttons for the homepage hero, announcement bar and policy pages.
      </p>
      {heroes.map((hero) => (
        <form key={hero.id} action={saveHero} className="space-y-3 rounded-3xl bg-white p-5">
          <input type="hidden" name="id" value={hero.id} />
          <h2 className="font-display text-2xl">Hero</h2>
          <Field label="Kicker"><input name="kicker" defaultValue={hero.kicker} className={inputClass} /></Field>
          <Field label="Title"><input name="title" defaultValue={hero.title} className={inputClass} /></Field>
          <Field label="Subtitle"><textarea name="subtitle" defaultValue={hero.subtitle} className={inputClass} /></Field>
          <Field label="Image URL"><input name="imageUrl" defaultValue={hero.imageUrl} className={inputClass} /></Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Primary button"><input name="ctaPrimaryLabel" defaultValue={hero.ctaPrimaryLabel} className={inputClass} /></Field>
            <Field label="Primary link"><input name="ctaPrimaryHref" defaultValue={hero.ctaPrimaryHref} className={inputClass} /></Field>
            <Field label="Second button"><input name="ctaSecondaryLabel" defaultValue={hero.ctaSecondaryLabel} className={inputClass} /></Field>
            <Field label="Second link"><input name="ctaSecondaryHref" defaultValue={hero.ctaSecondaryHref} className={inputClass} /></Field>
            <Field label="Third button"><input name="ctaTertiaryLabel" defaultValue={hero.ctaTertiaryLabel ?? ""} className={inputClass} /></Field>
            <Field label="Third link"><input name="ctaTertiaryHref" defaultValue={hero.ctaTertiaryHref ?? ""} className={inputClass} /></Field>
            <Field label="Fourth button"><input name="ctaQuaternaryLabel" defaultValue={hero.ctaQuaternaryLabel ?? ""} className={inputClass} /></Field>
            <Field label="Fourth link"><input name="ctaQuaternaryHref" defaultValue={hero.ctaQuaternaryHref ?? ""} className={inputClass} /></Field>
          </div>
          <div className="flex gap-3">
            <Button type="submit">Save hero</Button>
            <button name="action" value="delete" className="text-sm text-ajrak">Delete hero</button>
          </div>
        </form>
      ))}
      <form action={saveHero} className="space-y-3 rounded-3xl bg-white p-5">
        <h2 className="font-display text-2xl">Add another hero</h2>
        <Field label="Kicker"><input name="kicker" defaultValue="AA Maka Production" className={inputClass} /></Field>
        <Field label="Title"><input name="title" className={inputClass} /></Field>
        <Field label="Subtitle"><textarea name="subtitle" className={inputClass} /></Field>
        <Field label="Image URL"><input name="imageUrl" className={inputClass} /></Field>
        <Button type="submit">Add hero</Button>
      </form>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Announcement bar</h2>
        {announcements.map((a) => (
          <form key={a.id} action={saveAnnouncement} className="space-y-3 rounded-3xl bg-white p-5">
            <input type="hidden" name="id" value={a.id} />
            <Field label="Message"><input name="message" defaultValue={a.message} className={inputClass} /></Field>
            <Field label="Link"><input name="href" defaultValue={a.href ?? ""} className={inputClass} /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={a.active} /> Active</label>
            <div className="flex gap-3">
              <Button type="submit">Save</Button>
              <button name="action" value="delete" className="text-sm text-ajrak">Delete</button>
            </div>
          </form>
        ))}
        <form action={saveAnnouncement} className="space-y-3 rounded-3xl bg-white p-5">
          <Field label="New announcement"><input name="message" className={inputClass} /></Field>
          <Field label="Link"><input name="href" className={inputClass} /></Field>
          <Button type="submit">Add announcement</Button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Site pages</h2>
        {pages.map((p) => (
          <form key={p.id} action={savePage} className="space-y-3 rounded-3xl bg-white p-5">
            <Field label="Slug"><input name="slug" defaultValue={p.slug} className={inputClass} /></Field>
            <Field label="Title"><input name="title" defaultValue={p.title} className={inputClass} /></Field>
            <Field label="Body"><textarea name="body" rows={8} defaultValue={p.body} className={inputClass} /></Field>
            <div className="flex gap-3">
              <Button type="submit">Save page</Button>
              <button name="action" value="delete" className="text-sm text-ajrak">Delete page</button>
            </div>
          </form>
        ))}
        <form action={savePage} className="space-y-3 rounded-3xl bg-white p-5">
          <Field label="New page slug"><input name="slug" placeholder="about" className={inputClass} /></Field>
          <Field label="Title"><input name="title" className={inputClass} /></Field>
          <Field label="Body"><textarea name="body" rows={6} className={inputClass} /></Field>
          <Button type="submit">Add page</Button>
        </form>
      </section>
    </div>
  );
}
