import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { deleteHero, saveHero } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";
import { DeleteButton } from "@/components/admin/RowActions";

export default async function EditHeroPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content.manage");
  const { id } = await params;
  const hero = await prisma.homepageHero.findUnique({ where: { id } });
  if (!hero) notFound();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/homepage" className="text-sm text-ajrak">Back to homepage</Link>
      <h1 className="mt-3 font-display text-4xl">Edit hero</h1>
      <form action={saveHero} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <input type="hidden" name="id" value={hero.id} />
        <PicturePicker spec="hero" label="Hero picture" current={hero.imageUrl} />
        <Field label="Kicker"><input name="kicker" defaultValue={hero.kicker} className={inputClass} /></Field>
        <Field label="Title"><input name="title" defaultValue={hero.title} required className={inputClass} /></Field>
        <Field label="Subtitle"><textarea name="subtitle" defaultValue={hero.subtitle} className={inputClass} /></Field>
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
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={hero.active} /> Active</label>
        <Button type="submit">Save changes</Button>
      </form>
      <div className="mt-4"><DeleteButton action={deleteHero} id={hero.id} label="Delete hero" /></div>
    </div>
  );
}
