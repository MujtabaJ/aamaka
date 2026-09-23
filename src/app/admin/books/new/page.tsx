import { requirePermission } from "@/lib/session";
import { saveBook } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";
import Link from "next/link";

export default async function NewBookPage() {
  await requirePermission("content.manage");
  return (
    <div className="max-w-3xl">
      <Link href="/admin/books" className="text-sm text-ajrak">Back to books</Link>
      <h1 className="mt-3 font-display text-4xl">Add book</h1>
      <form action={saveBook} encType="multipart/form-data" className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <PicturePicker spec="book" label="Book cover" fileName="coverFile" urlName="coverUrl" />
        <Field label="Title"><input name="title" required className={inputClass} /></Field>
        <Field label="Sindhi title"><input name="titleSd" className={inputClass} /></Field>
        <Field label="Author"><input name="author" required className={inputClass} /></Field>
        <Field label="Price (PKR)"><input name="price" type="number" required className={inputClass} /></Field>
        <Field label="Stock"><input name="stock" type="number" defaultValue={20} className={inputClass} /></Field>
        <Field label="Description"><textarea name="description" className={inputClass} /></Field>
        <Button type="submit">Save book</Button>
      </form>
    </div>
  );
}
