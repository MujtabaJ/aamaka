import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { saveFaq } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";

export default async function NewFaqPage() {
  await requirePermission("content.manage");
  return (
    <div className="max-w-3xl">
      <Link href="/admin/faqs" className="text-sm text-ajrak">Back to FAQs</Link>
      <h1 className="mt-3 font-display text-4xl">Add FAQ</h1>
      <form action={saveFaq} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <Field label="Question"><input name="question" required className={inputClass} /></Field>
        <Field label="Answer"><textarea name="answer" required rows={5} className={inputClass} /></Field>
        <Field label="Sort order"><input name="sortOrder" type="number" defaultValue={0} className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked /> Published</label>
        <Button type="submit">Save FAQ</Button>
      </form>
    </div>
  );
}
