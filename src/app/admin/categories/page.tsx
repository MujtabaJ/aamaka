import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { toSlug } from "@/lib/utils";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { revalidatePath } from "next/cache";

export default async function AdminCategoriesPage() {
  await requirePermission("products.manage");
  const categories = await prisma.productCategory.findMany({ include: { parent: true, children: true } });
  async function create(form: FormData) {
    "use server";
    const name = String(form.get("name"));
    await prisma.productCategory.create({
      data: {
        name,
        slug: toSlug(name),
        parentId: String(form.get("parentId") || "") || null,
        published: true,
      },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/shop");
  }
  async function update(form: FormData) {
    "use server";
    await requirePermission("products.manage");
    const id = String(form.get("id"));
    if (form.get("action") === "delete") {
      await prisma.productCategory.update({ where: { id }, data: { published: false } });
    } else {
      await prisma.productCategory.update({
        where: { id },
        data: {
          name: String(form.get("name")),
          description: String(form.get("description") || "") || null,
          imageUrl: String(form.get("imageUrl") || "") || null,
          published: form.get("published") === "on",
        },
      });
    }
    revalidatePath("/admin/categories");
    revalidatePath("/shop");
  }
  return (
    <div>
      <h1 className="font-display text-4xl">Categories</h1>
      <form action={create} className="mt-6 space-y-3 rounded-3xl bg-white p-5">
        <Field label="Name"><input name="name" required className={inputClass} /></Field>
        <Field label="Parent">
          <select name="parentId" className={inputClass}>
            <option value="">None</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Button type="submit">Add category</Button>
      </form>
      <ul className="mt-6 space-y-3">
        {categories.map((c) => (
          <li key={c.id} className="rounded-2xl bg-white p-4 text-sm">
            <form action={update} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={c.id} />
              <Field label="Name"><input name="name" defaultValue={c.name} className={inputClass} /></Field>
              <Field label="Image URL"><input name="imageUrl" defaultValue={c.imageUrl ?? ""} className={inputClass} /></Field>
              <div className="md:col-span-2">
                <Field label="Description"><textarea name="description" defaultValue={c.description ?? ""} className={inputClass} /></Field>
              </div>
              <label className="flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={c.published} /> Published</label>
              <div className="flex gap-3">
                <Button type="submit">Save</Button>
                <button name="action" value="delete" className="text-ajrak">Hide</button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
