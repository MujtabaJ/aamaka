import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { deleteBook, saveBook } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";
import { DeleteButton } from "@/components/admin/RowActions";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content.manage");
  const { id } = await params;
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) notFound();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/books" className="text-sm text-ajrak">Back to books</Link>
      <h1 className="mt-3 font-display text-4xl">Edit {book.title}</h1>
      <form action={saveBook} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <input type="hidden" name="id" value={book.id} />
        <PicturePicker label="Book cover" fileName="coverFile" urlName="coverUrl" current={book.coverUrl} />
        <Field label="Title"><input name="title" defaultValue={book.title} required className={inputClass} /></Field>
        <Field label="Sindhi title"><input name="titleSd" defaultValue={book.titleSd ?? ""} className={inputClass} /></Field>
        <Field label="Author"><input name="author" defaultValue={book.author} required className={inputClass} /></Field>
        <Field label="Category"><input name="category" defaultValue={book.category} className={inputClass} /></Field>
        <Field label="Price (PKR)"><input name="price" type="number" defaultValue={Math.round(book.pricePaisa / 100)} className={inputClass} /></Field>
        <Field label="Stock"><input name="stock" type="number" defaultValue={book.stock} className={inputClass} /></Field>
        <Field label="Excerpt"><input name="excerpt" defaultValue={book.excerpt ?? ""} className={inputClass} /></Field>
        <Field label="Description"><textarea name="description" defaultValue={book.description} className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={book.published} /> Published</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={book.featured} /> Featured</label>
        <Button type="submit">Save changes</Button>
      </form>
      <div className="mt-4"><DeleteButton action={deleteBook} id={book.id} label="Delete book" /></div>
    </div>
  );
}
