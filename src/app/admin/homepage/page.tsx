import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { revalidatePath } from "next/cache";
import { getHomepageSections, saveHomepageSections, type HomepageSection, type HomepageSectionKey } from "@/lib/homepage";
import { savePublicFile, validateUpload } from "@/lib/media";

async function uploadedImage(form: FormData, field = "imageFile") {
  const value = form.get(field);
  if (!value || typeof value === "string" || !value.size) return "";
  validateUpload("image", value.type, value.size);
  return savePublicFile("homepage", value.name, Buffer.from(await value.arrayBuffer()));
}

export default async function AdminHomepagePage() {
  await requirePermission("content.manage");
  const [heroes, announcements, pages, sections] = await Promise.all([
    prisma.homepageHero.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.announcement.findMany(),
    prisma.sitePage.findMany(),
    getHomepageSections(),
  ]);

  async function saveHero(form: FormData) {
    "use server";
    await requirePermission("content.manage");
    const id = String(form.get("id") || "");
    const uploaded = await uploadedImage(form);
    const data = {
      kicker: String(form.get("kicker") || ""),
      title: String(form.get("title") || ""),
      subtitle: String(form.get("subtitle") || ""),
      imageUrl: uploaded || String(form.get("imageUrl") || "/media/covers/hero.svg"),
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

  async function saveSection(form: FormData) {
    "use server";
    await requirePermission("content.manage");
    const current = await getHomepageSections();
    const id = String(form.get("id"));
    if (form.get("action") === "delete") {
      await saveHomepageSections(current.filter((section) => section.id !== id || section.key !== "custom"));
    } else {
      const uploaded = await uploadedImage(form);
      const next: HomepageSection = {
        id,
        key: String(form.get("key") || "custom") as HomepageSectionKey,
        eyebrow: String(form.get("eyebrow") || ""),
        title: String(form.get("title") || ""),
        subtitle: String(form.get("subtitle") || ""),
        imageUrl: uploaded || String(form.get("imageUrl") || ""),
        ctaLabel: String(form.get("ctaLabel") || ""),
        ctaHref: String(form.get("ctaHref") || ""),
        visible: form.get("visible") === "on",
        sortOrder: Number(form.get("sortOrder") || 0),
      };
      const exists = current.some((section) => section.id === id);
      await saveHomepageSections(exists ? current.map((section) => (section.id === id ? next : section)) : [...current, next]);
    }
    revalidatePath("/admin/homepage");
    revalidatePath("/");
    revalidatePath("/music");
    revalidatePath("/albums");
    revalidatePath("/books");
    revalidatePath("/shop");
    revalidatePath("/artists");
    revalidatePath("/stories");
    revalidatePath("/membership");
    revalidatePath("/about");
    revalidatePath("/faq");
    revalidatePath("/contact");
  }

  async function addCustomSection() {
    "use server";
    await requirePermission("content.manage");
    const current = await getHomepageSections();
    const id = `custom-${Date.now()}`;
    await saveHomepageSections([
      ...current,
      {
        id,
        key: "custom",
        eyebrow: "New section",
        title: "Untitled section",
        subtitle: "Add a title, description and picture.",
        imageUrl: "",
        ctaLabel: "Learn more",
        ctaHref: "/",
        visible: true,
        sortOrder: (current.at(-1)?.sortOrder ?? 100) + 10,
      },
    ]);
    revalidatePath("/admin/homepage");
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
        Change the picture, name and description of every homepage section. The same titles and images also drive the public listing pages.
      </p>

      {heroes.map((hero) => (
        <form key={hero.id} action={saveHero} className="space-y-3 rounded-3xl bg-white p-5">
          <input type="hidden" name="id" value={hero.id} />
          <h2 className="font-display text-2xl">Hero</h2>
          {hero.imageUrl ? (
            <div className="h-32 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${hero.imageUrl})` }} />
          ) : null}
          <Field label="Kicker"><input name="kicker" defaultValue={hero.kicker} className={inputClass} /></Field>
          <Field label="Title"><input name="title" defaultValue={hero.title} className={inputClass} /></Field>
          <Field label="Subtitle"><textarea name="subtitle" defaultValue={hero.subtitle} className={inputClass} /></Field>
          <Field label="Image URL"><input name="imageUrl" defaultValue={hero.imageUrl} className={inputClass} /></Field>
          <Field label="Or upload a new picture"><input name="imageFile" type="file" accept="image/*" /></Field>
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
        <Field label="Or upload a picture"><input name="imageFile" type="file" accept="image/*" /></Field>
        <Button type="submit">Add hero</Button>
      </form>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Homepage sections</h2>
          <form action={addCustomSection}>
            <Button type="submit">Add custom section</Button>
          </form>
        </div>
        {sections.map((section) => (
          <form key={section.id} action={saveSection} className="space-y-3 rounded-3xl bg-white p-5">
            <input type="hidden" name="id" value={section.id} />
            <input type="hidden" name="key" value={section.key} />
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-xl capitalize">{section.key} section</h3>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="visible" defaultChecked={section.visible} /> Show
              </label>
            </div>
            {section.imageUrl ? (
              <div className="h-28 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${section.imageUrl})` }} />
            ) : null}
            <Field label="Eyebrow / small title"><input name="eyebrow" defaultValue={section.eyebrow} className={inputClass} /></Field>
            <Field label="Title"><input name="title" defaultValue={section.title} className={inputClass} /></Field>
            <Field label="Description"><textarea name="subtitle" defaultValue={section.subtitle} className={inputClass} /></Field>
            <Field label="Picture URL"><input name="imageUrl" defaultValue={section.imageUrl} className={inputClass} /></Field>
            <Field label="Or upload a new picture"><input name="imageFile" type="file" accept="image/*" /></Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Button label"><input name="ctaLabel" defaultValue={section.ctaLabel} className={inputClass} /></Field>
              <Field label="Button link"><input name="ctaHref" defaultValue={section.ctaHref} className={inputClass} /></Field>
              <Field label="Sort order"><input name="sortOrder" type="number" defaultValue={section.sortOrder} className={inputClass} /></Field>
            </div>
            <div className="flex gap-3">
              <Button type="submit">Save section</Button>
              {section.key === "custom" ? (
                <button name="action" value="delete" className="text-sm text-ajrak">Delete section</button>
              ) : null}
            </div>
          </form>
        ))}
      </section>

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
