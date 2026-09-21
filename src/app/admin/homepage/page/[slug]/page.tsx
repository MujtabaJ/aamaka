import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { deletePage, savePage } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";

export default async function EditSitePage({ params }: { params: Promise<{ slug: string }> }) {
  await requirePermission("content.manage");
  const { slug } = await params;
  const page = await prisma.sitePage.findUnique({ where: { slug } });
  if (!page) notFound();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/homepage" className="text-sm text-ajrak">Back to homepage</Link>
      <h1 className="mt-3 font-display text-4xl">Edit {page.title}</h1>
      <form action={savePage} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <Field label="Slug"><input name="slug" defaultValue={page.slug} required className={inputClass} /></Field>
        <Field label="Title"><input name="title" defaultValue={page.title} required className={inputClass} /></Field>
        <Field label="Body"><textarea name="body" rows={8} defaultValue={page.body} className={inputClass} /></Field>
        <Button type="submit">Save changes</Button>
      </form>
      <form action={deletePage} className="mt-4">
        <input type="hidden" name="slug" value={page.slug} />
        <button className="rounded-full border border-ajrak/40 px-3 py-1.5 text-sm text-ajrak">Delete page</button>
      </form>
    </div>
  );
}
