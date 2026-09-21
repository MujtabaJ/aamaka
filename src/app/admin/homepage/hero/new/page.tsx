import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { saveHero } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";

export default async function NewHeroPage() {
  await requirePermission("content.manage");
  return (
    <div className="max-w-3xl">
      <Link href="/admin/homepage" className="text-sm text-ajrak">Back to homepage</Link>
      <h1 className="mt-3 font-display text-4xl">Add hero</h1>
      <form action={saveHero} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <PicturePicker label="Hero picture" />
        <Field label="Kicker"><input name="kicker" defaultValue="AA Maka Production" className={inputClass} /></Field>
        <Field label="Title"><input name="title" required className={inputClass} /></Field>
        <Field label="Subtitle"><textarea name="subtitle" className={inputClass} /></Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Primary button"><input name="ctaPrimaryLabel" defaultValue="Listen Now" className={inputClass} /></Field>
          <Field label="Primary link"><input name="ctaPrimaryHref" defaultValue="/music" className={inputClass} /></Field>
          <Field label="Second button"><input name="ctaSecondaryLabel" defaultValue="Explore Music" className={inputClass} /></Field>
          <Field label="Second link"><input name="ctaSecondaryHref" defaultValue="/music" className={inputClass} /></Field>
        </div>
        <Button type="submit">Save hero</Button>
      </form>
    </div>
  );
}
