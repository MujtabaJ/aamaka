import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { savePage } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";

export default async function NewSitePage() {
  await requirePermission("content.manage");
  return (
    <div className="max-w-3xl">
      <Link href="/admin/homepage" className="text-sm text-ajrak">Back to homepage</Link>
      <h1 className="mt-3 font-display text-4xl">Add page</h1>
      <form action={savePage} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <Field label="Slug"><input name="slug" placeholder="about" required className={inputClass} /></Field>
        <Field label="Title"><input name="title" required className={inputClass} /></Field>
        <Field label="Body"><textarea name="body" rows={8} className={inputClass} /></Field>
        <Button type="submit">Save page</Button>
      </form>
    </div>
  );
}
