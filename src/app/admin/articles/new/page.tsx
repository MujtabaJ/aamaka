import { requirePermission } from "@/lib/session";
import { saveArticle } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";
import Link from "next/link";

export default async function NewArticlePage() {
  await requirePermission("content.manage");
  return (
    <div className="max-w-3xl">
      <Link href="/admin/articles" className="text-sm text-ajrak">Back to articles</Link>
      <h1 className="mt-3 font-display text-4xl">Add article</h1>
      <form action={saveArticle} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <PicturePicker label="Cover picture" fileName="coverFile" urlName="coverUrl" />
        <Field label="Title"><input name="title" required className={inputClass} /></Field>
        <Field label="Excerpt"><input name="excerpt" className={inputClass} /></Field>
        <Field label="Body"><textarea name="body" rows={8} className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked /> Publish</label>
        <Button type="submit">Save article</Button>
      </form>
    </div>
  );
}
