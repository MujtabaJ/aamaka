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
      <ul className="mt-6 space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="rounded-2xl bg-white p-4 text-sm">
            {c.parent ? `${c.parent.name} / ` : ""}
            {c.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
