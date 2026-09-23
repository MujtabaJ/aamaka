import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { getHomepageSections } from "@/lib/homepage";
import { deleteHomepageSection, saveHomepageSection } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";
import { DeleteButton } from "@/components/admin/RowActions";

export default async function EditHomepageSectionPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content.manage");
  const { id } = await params;
  const section = (await getHomepageSections()).find((item) => item.id === id);
  if (!section) notFound();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/homepage" className="text-sm text-ajrak">Back to homepage</Link>
      <h1 className="mt-3 font-display text-4xl">Edit {section.title}</h1>
      <form action={saveHomepageSection} encType="multipart/form-data" className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <input type="hidden" name="id" value={section.id} />
        <PicturePicker spec="section" label="Section picture" current={section.imageUrl} />
        <Field label="Eyebrow / small title"><input name="eyebrow" defaultValue={section.eyebrow} className={inputClass} /></Field>
        <Field label="Title"><input name="title" defaultValue={section.title} className={inputClass} /></Field>
        <Field label="Description"><textarea name="subtitle" defaultValue={section.subtitle} className={inputClass} /></Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Button label"><input name="ctaLabel" defaultValue={section.ctaLabel} className={inputClass} /></Field>
          <Field label="Button link"><input name="ctaHref" defaultValue={section.ctaHref} className={inputClass} /></Field>
          <Field label="Sort order"><input name="sortOrder" type="number" defaultValue={section.sortOrder} className={inputClass} /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="visible" defaultChecked={section.visible} /> Visible</label>
        <Button type="submit">Save changes</Button>
      </form>
      <div className="mt-4"><DeleteButton action={deleteHomepageSection} id={section.id} label="Delete section" /></div>
    </div>
  );
}
