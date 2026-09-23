import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { getHomepageSections } from "@/lib/homepage";
import { DeleteButton, RowActions } from "@/components/admin/RowActions";
import { AdminThumb } from "@/components/admin/AdminThumb";
import { addCustomSection, deleteAnnouncement, deleteHero, deleteHomepageSection, deletePage } from "@/app/admin/entity-actions";

export default async function AdminHomepagePage() {
  await requirePermission("content.manage");
  const [heroes, announcements, pages, sections] = await Promise.all([
    prisma.homepageHero.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.announcement.findMany(),
    prisma.sitePage.findMany(),
    getHomepageSections(),
  ]);
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl">Homepage & pages</h1>
        <p className="mt-2 text-sm text-ink/60">Edit or delete any hero, section, announcement or page. Use Change picture on the edit screen to replace images from your computer.</p>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Hero banners</h2>
          <Link href="/admin/homepage/hero/new" className="rounded-full bg-ajrak px-4 py-2 text-sm text-cream">Add hero</Link>
        </div>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="text-ink/50"><th className="py-2">Picture</th><th>Title</th><th>Status</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {heroes.map((hero) => (
              <tr key={hero.id} className="border-t border-ink/10">
                <td className="py-3">
                  <AdminThumb src={hero.imageUrl} spec="hero" wide />
                </td>
                <td>{hero.title}</td>
                <td>{hero.active ? "Active" : "Hidden"}</td>
                <td><RowActions editHref={`/admin/homepage/hero/${hero.id}`} deleteAction={deleteHero} id={hero.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Homepage sections</h2>
          <form action={addCustomSection}>
            <button className="rounded-full bg-ajrak px-4 py-2 text-sm text-cream">Add custom section</button>
          </form>
        </div>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="text-ink/50"><th className="py-2">Picture</th><th>Section</th><th>Title</th><th>Status</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <tr key={section.id} className="border-t border-ink/10">
                <td className="py-3">
                  <AdminThumb src={section.imageUrl} spec="section" />
                </td>
                <td className="capitalize">{section.key}</td>
                <td>{section.title}</td>
                <td>{section.visible ? "Visible" : "Hidden"}</td>
                <td><RowActions editHref={`/admin/homepage/section/${section.id}`} deleteAction={deleteHomepageSection} id={section.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Announcements</h2>
          <Link href="/admin/homepage/announcement/new" className="rounded-full bg-ajrak px-4 py-2 text-sm text-cream">Add announcement</Link>
        </div>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="text-ink/50"><th className="py-2">Message</th><th>Status</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {announcements.map((announcement) => (
              <tr key={announcement.id} className="border-t border-ink/10">
                <td className="py-3">{announcement.message}</td>
                <td>{announcement.active ? "Active" : "Hidden"}</td>
                <td><RowActions editHref={`/admin/homepage/announcement/${announcement.id}`} deleteAction={deleteAnnouncement} id={announcement.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Site pages</h2>
          <Link href="/admin/homepage/page/new" className="rounded-full bg-ajrak px-4 py-2 text-sm text-cream">Add page</Link>
        </div>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="text-ink/50"><th className="py-2">Slug</th><th>Title</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-t border-ink/10">
                <td className="py-3">{page.slug}</td>
                <td>{page.title}</td>
                <td>
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/homepage/page/${page.slug}`} className="rounded-full bg-ink px-3 py-1.5 text-sm text-cream">Edit</Link>
                    <DeleteButton action={deletePage} id={page.slug} name="slug" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
