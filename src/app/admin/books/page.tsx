import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { toSlug } from "@/lib/utils";
import { rupeesToPaisa, formatMoney } from "@/lib/money";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { ImageFields } from "@/components/admin/ImageFields";
import { imageFromForm } from "@/lib/admin-images";
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
        coverUrl: await imageFromForm(form, "coverFile", "coverUrl"),
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

  async function update(form: FormData) {
    "use server";
    await requirePermission("content.manage");
    const id = String(form.get("id"));
    const action = String(form.get("action"));
    if (action === "delete") {
      const used = await prisma.orderItem.count({ where: { bookId: id } });
      if (used === 0) await prisma.book.delete({ where: { id } });
      else {
        await prisma.book.update({ where: { id }, data: { published: false } });
      }
    } else {
      await prisma.book.update({
        where: { id },
        data: {
          title: String(form.get("title")),
          titleSd: String(form.get("titleSd") || "") || null,
          author: String(form.get("author")),
          category: String(form.get("category") || "poetry"),
          description: String(form.get("description") || ""),
          excerpt: String(form.get("excerpt") || "") || null,
          coverUrl: await imageFromForm(form, "coverFile", "coverUrl", (await prisma.book.findUnique({ where: { id } }))?.coverUrl),
          stock: Number(form.get("stock") || 0),
          pricePaisa: rupeesToPaisa(Number(form.get("price") || 0)),
          published: form.get("published") === "on",
          featured: form.get("featured") === "on",
        },
      });
    }
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
        <div className="md:col-span-2"><ImageFields label="Cover" urlName="coverUrl" fileName="coverFile" /></div>
        <Field label="Excerpt"><input name="excerpt" className={inputClass} /></Field>
        <div className="md:col-span-2">
          <Field label="Description"><textarea name="description" rows={4} className={inputClass} /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" /> Featured</label>
        <Button type="submit">Add book</Button>
      </form>
      <ul className="mt-6 space-y-3">
        {books.length === 0 ? <p className="text-sm text-ink/60">No books yet.</p> : null}
        {books.map((b) => (
          <li key={b.id} className="rounded-2xl bg-white p-4">
            <p className="text-sm">
              {b.title} · {b.author} · {b.category} · {b.format} · {formatMoney(b.pricePaisa)}
            </p>
            <form action={update} className="mt-3 grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={b.id} />
              <Field label="Title"><input name="title" defaultValue={b.title} className={inputClass} /></Field>
              <Field label="Sindhi title"><input name="titleSd" defaultValue={b.titleSd ?? ""} className={inputClass} /></Field>
              <Field label="Author"><input name="author" defaultValue={b.author} className={inputClass} /></Field>
              <Field label="Category"><input name="category" defaultValue={b.category} className={inputClass} /></Field>
              <Field label="Price (PKR)">
                <input name="price" type="number" defaultValue={Math.round(b.pricePaisa / 100)} className={inputClass} />
              </Field>
              <Field label="Stock">
                <input name="stock" type="number" defaultValue={b.stock} className={inputClass} />
              </Field>
              <div className="md:col-span-2">
                <ImageFields label="Cover" urlName="coverUrl" fileName="coverFile" url={b.coverUrl} />
              </div>
              <div className="md:col-span-2">
                <Field label="Excerpt"><input name="excerpt" defaultValue={b.excerpt ?? ""} className={inputClass} /></Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Description"><textarea name="description" defaultValue={b.description} className={inputClass} /></Field>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="published" defaultChecked={b.published} /> Published
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="featured" defaultChecked={b.featured} /> Featured
              </label>
              <div className="flex gap-3 md:col-span-2">
                <Button type="submit">Save</Button>
                <button name="action" value="delete" className="text-ajrak">
                  Remove
                </button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
