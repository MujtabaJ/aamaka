import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { deleteFaq, saveFaq } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { DeleteButton } from "@/components/admin/RowActions";

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content.manage");
  const { id } = await params;
  const faq = await prisma.faq.findUnique({ where: { id } });
  if (!faq) notFound();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/faqs" className="text-sm text-ajrak">Back to FAQs</Link>
      <h1 className="mt-3 font-display text-4xl">Edit FAQ</h1>
      <form action={saveFaq} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <input type="hidden" name="id" value={faq.id} />
        <Field label="Question"><input name="question" defaultValue={faq.question} required className={inputClass} /></Field>
        <Field label="Answer"><textarea name="answer" defaultValue={faq.answer} required rows={5} className={inputClass} /></Field>
        <Field label="Sort order"><input name="sortOrder" type="number" defaultValue={faq.sortOrder} className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={faq.published} /> Published</label>
        <Button type="submit">Save changes</Button>
      </form>
      <div className="mt-4"><DeleteButton action={deleteFaq} id={faq.id} label="Delete FAQ" /></div>
    </div>
  );
}
