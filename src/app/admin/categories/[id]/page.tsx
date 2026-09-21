import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { deleteCategory, saveCategory } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";
import { DeleteButton } from "@/components/admin/RowActions";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("products.manage");
  const { id } = await params;
  const category = await prisma.productCategory.findUnique({ where: { id } });
  if (!category) notFound();
  const parents = await prisma.productCategory.findMany({ where: { id: { not: id } }, orderBy: { name: "asc" } });
  return (
    <div className="max-w-3xl">
      <Link href="/admin/categories" className="text-sm text-ajrak">Back to categories</Link>
      <h1 className="mt-3 font-display text-4xl">Edit {category.name}</h1>
      <form action={saveCategory} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <input type="hidden" name="id" value={category.id} />
        <PicturePicker label="Category picture" fileName="photoFile" urlName="photoUrl" current={category.imageUrl} />
        <Field label="Name"><input name="name" defaultValue={category.name} required className={inputClass} /></Field>
        <Field label="Parent">
          <select name="parentId" defaultValue={category.parentId ?? ""} className={inputClass}>
            <option value="">None</option>
            {parents.map((parent) => <option key={parent.id} value={parent.id}>{parent.name}</option>)}
          </select>
        </Field>
        <Field label="Description"><textarea name="description" defaultValue={category.description ?? ""} className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={category.published} /> Published</label>
        <Button type="submit">Save changes</Button>
      </form>
      <div className="mt-4"><DeleteButton action={deleteCategory} id={category.id} label="Delete category" /></div>
    </div>
  );
}
