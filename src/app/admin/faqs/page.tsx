import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { revalidatePath } from "next/cache";

export default async function AdminFaqsPage() {
  await requirePermission("content.manage");
  const faqs = await prisma.faq.findMany({ orderBy: { sortOrder: "asc" } });

  async function create(form: FormData) {
    "use server";
    await requirePermission("content.manage");
    await prisma.faq.create({
      data: {
        question: String(form.get("question")),
        answer: String(form.get("answer")),
        sortOrder: Number(form.get("sortOrder") || 0),
        published: form.get("published") === "on",
      },
    });
    revalidatePath("/admin/faqs");
    revalidatePath("/faq");
  }

  async function update(form: FormData) {
    "use server";
    await requirePermission("content.manage");
    const id = String(form.get("id"));
    if (form.get("action") === "delete") {
      await prisma.faq.delete({ where: { id } });
    } else {
      await prisma.faq.update({
        where: { id },
        data: {
          question: String(form.get("question")),
          answer: String(form.get("answer")),
          published: form.get("published") === "on",
        },
      });
    }
    revalidatePath("/admin/faqs");
    revalidatePath("/faq");
  }

  return (
    <div>
      <h1 className="font-display text-4xl">FAQs</h1>
      <form action={create} className="mt-6 space-y-3 rounded-3xl bg-white p-5">
        <Field label="Question"><input name="question" required className={inputClass} /></Field>
        <Field label="Answer"><textarea name="answer" required rows={3} className={inputClass} /></Field>
        <Field label="Sort order"><input name="sortOrder" type="number" defaultValue={0} className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked /> Published</label>
        <Button type="submit">Add FAQ</Button>
      </form>
      <ul className="mt-6 space-y-3">
        {faqs.map((faq) => (
          <li key={faq.id} className="rounded-2xl bg-white p-4">
            <form action={update} className="space-y-3">
              <input type="hidden" name="id" value={faq.id} />
              <Field label="Question"><input name="question" defaultValue={faq.question} className={inputClass} /></Field>
              <Field label="Answer"><textarea name="answer" defaultValue={faq.answer} rows={3} className={inputClass} /></Field>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="published" defaultChecked={faq.published} /> Published
              </label>
              <div className="flex gap-3">
                <Button type="submit">Save</Button>
                <button name="action" value="delete" className="text-ajrak">Delete</button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
