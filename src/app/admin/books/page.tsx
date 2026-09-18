import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { toSlug } from "@/lib/utils";
import { rupeesToPaisa, formatMoney } from "@/lib/money";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { revalidatePath } from "next/cache";

export default async function AdminBooksPage() {
  await requirePermission("content.manage");
  const books = await prisma.book.findMany({ orderBy: { createdAt: "desc" } });

  async function create(form: FormData) {
    "use server";
    await requirePermission("content.manage");
    const title = String(form.get("title"));
    await prisma.book.create({
      data: {
        title,
        slug: toSlug(title),
        titleSd: String(form.get("titleSd") || "") || null,
        author: String(form.get("author")),
        category: String(form.get("category") || "poetry"),
        format: String(form.get("format") || "paperback"),
        language: String(form.get("language") || "Sindhi"),
        pages: form.get("pages") ? Number(form.get("pages")) : null,
        description: String(form.get("description") || ""),
        excerpt: String(form.get("excerpt") || "") || null,
        coverUrl: String(form.get("coverUrl") || "") || null,
        pricePaisa: rupeesToPaisa(Number(form.get("price") || 0)),
        salePricePaisa: form.get("salePrice") ? rupeesToPaisa(Number(form.get("salePrice"))) : null,
        stock: Number(form.get("stock") || 0),
        featured: form.get("featured") === "on",
        published: true,
      },
    });
    revalidatePath("/admin/books");
    revalidatePath("/books");
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Books</h1>
      <form action={create} className="mt-6 grid gap-3 rounded-3xl bg-white p-5 md:grid-cols-2">
        <Field label="Title"><input name="title" required className={inputClass} /></Field>
        <Field label="Sindhi title"><input name="titleSd" className={inputClass} /></Field>
        <Field label="Author"><input name="author" required className={inputClass} /></Field>
        <Field label="Category">
          <select name="category" className={inputClass}>
            <option value="poetry">Poetry</option>
            <option value="sufi">Sufi</option>
            <option value="folk">Folk</option>
            <option value="history">History</option>
            <option value="children">Children</option>
            <option value="music">Music</option>
          </select>
        </Field>
        <Field label="Format">
          <select name="format" className={inputClass}>
            <option value="paperback">Paperback</option>
            <option value="hardcover">Hardcover</option>
            <option value="ebook">Ebook</option>
          </select>
        </Field>
        <Field label="Language"><input name="language" defaultValue="Sindhi" className={inputClass} /></Field>
        <Field label="Pages"><input name="pages" type="number" className={inputClass} /></Field>
        <Field label="Price (PKR)"><input name="price" type="number" required className={inputClass} /></Field>
        <Field label="Sale price"><input name="salePrice" type="number" className={inputClass} /></Field>
        <Field label="Stock"><input name="stock" type="number" defaultValue={20} className={inputClass} /></Field>
        <Field label="Cover image URL"><input name="coverUrl" className={inputClass} /></Field>
        <Field label="Excerpt"><input name="excerpt" className={inputClass} /></Field>
        <div className="md:col-span-2">
          <Field label="Description"><textarea name="description" rows={4} className={inputClass} /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" /> Featured</label>
        <Button type="submit">Add book</Button>
      </form>
      <ul className="mt-6 space-y-2">
        {books.map((b) => (
          <li key={b.id} className="rounded-2xl bg-white p-4 text-sm">
            {b.title} · {b.author} · {b.category} · {b.format} · {formatMoney(b.pricePaisa)} · stock {b.stock}
          </li>
        ))}
      </ul>
    </div>
  );
}
