import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { toSlug } from "@/lib/utils";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { revalidatePath } from "next/cache";

export default async function AdminArticlesPage() {
  const user = await requirePermission("content.manage");
  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });

  async function create(form: FormData) {
    "use server";
    await requirePermission("content.manage");
    const title = String(form.get("title"));
    await prisma.article.create({
      data: {
        title,
        slug: toSlug(title),
        excerpt: String(form.get("excerpt") || ""),
        body: String(form.get("body") || ""),
        coverUrl: String(form.get("coverUrl") || "") || null,
        authorId: user.id,
        authorName: user.name ?? "AA Maka Production",
        published: form.get("published") === "on",
        publishedAt: new Date(),
      },
    });
    revalidatePath("/admin/articles");
    revalidatePath("/stories");
  }

  async function update(form: FormData) {
    "use server";
    await requirePermission("content.manage");
    const id = String(form.get("id"));
    if (form.get("action") === "delete") {
      await prisma.article.delete({ where: { id } });
    } else {
      await prisma.article.update({
        where: { id },
        data: {
          title: String(form.get("title")),
          excerpt: String(form.get("excerpt") || ""),
          body: String(form.get("body") || ""),
          coverUrl: String(form.get("coverUrl") || "") || null,
          published: form.get("published") === "on",
        },
      });
    }
    revalidatePath("/admin/articles");
    revalidatePath("/stories");
    revalidatePath("/");
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Articles</h1>
      <form action={create} className="mt-6 space-y-3 rounded-3xl bg-white p-5">
        <Field label="Title"><input name="title" required className={inputClass} /></Field>
        <Field label="Excerpt"><input name="excerpt" className={inputClass} /></Field>
        <Field label="Cover image URL"><input name="coverUrl" className={inputClass} /></Field>
        <Field label="Body (Markdown)"><textarea name="body" rows={8} className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked /> Publish</label>
        <Button type="submit">Create article</Button>
      </form>
      <ul className="mt-6 space-y-3">
        {articles.map((a) => (
          <li key={a.id} className="rounded-2xl bg-white p-4">
            <form action={update} className="space-y-3">
              <input type="hidden" name="id" value={a.id} />
              <Field label="Title"><input name="title" defaultValue={a.title} className={inputClass} /></Field>
              <Field label="Excerpt"><input name="excerpt" defaultValue={a.excerpt} className={inputClass} /></Field>
              <Field label="Cover image URL"><input name="coverUrl" defaultValue={a.coverUrl ?? ""} className={inputClass} /></Field>
              <Field label="Body"><textarea name="body" rows={6} defaultValue={a.body} className={inputClass} /></Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={a.published} /> Published</label>
              <div className="flex gap-3">
                <Button type="submit">Save</Button>
                <button name="action" value="delete" className="text-sm text-ajrak">Delete</button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
