import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { deleteArticle, saveArticle } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";
import { DeleteButton } from "@/components/admin/RowActions";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content.manage");
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/articles" className="text-sm text-ajrak">Back to articles</Link>
      <h1 className="mt-3 font-display text-4xl">Edit {article.title}</h1>
      <form action={saveArticle} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <input type="hidden" name="id" value={article.id} />
        <PicturePicker label="Cover picture" fileName="coverFile" urlName="coverUrl" current={article.coverUrl} />
        <Field label="Title"><input name="title" defaultValue={article.title} required className={inputClass} /></Field>
        <Field label="Excerpt"><input name="excerpt" defaultValue={article.excerpt} className={inputClass} /></Field>
        <Field label="Body"><textarea name="body" rows={8} defaultValue={article.body} className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={article.published} /> Published</label>
        <Button type="submit">Save changes</Button>
      </form>
      <div className="mt-4"><DeleteButton action={deleteArticle} id={article.id} label="Delete article" /></div>
    </div>
  );
}
