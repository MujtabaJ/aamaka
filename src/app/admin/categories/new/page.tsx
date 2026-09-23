import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { saveCategory } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";

export default async function NewCategoryPage() {
  await requirePermission("products.manage");
  const categories = await prisma.productCategory.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="max-w-3xl">
      <Link href="/admin/categories" className="text-sm text-ajrak">Back to categories</Link>
      <h1 className="mt-3 font-display text-4xl">Add category</h1>
      <form action={saveCategory} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <PicturePicker spec="category" label="Category picture" fileName="photoFile" urlName="photoUrl" />
        <Field label="Name"><input name="name" required className={inputClass} /></Field>
        <Field label="Parent">
          <select name="parentId" className={inputClass}>
            <option value="">None</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </Field>
        <Field label="Description"><textarea name="description" className={inputClass} /></Field>
        <Button type="submit">Save category</Button>
      </form>
    </div>
  );
}
