import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { RowActions } from "@/components/admin/RowActions";
import { AdminThumb } from "@/components/admin/AdminThumb";
import { deleteCategory } from "@/app/admin/entity-actions";

export default async function AdminCategoriesPage() {
  await requirePermission("products.manage");
  const categories = await prisma.productCategory.findMany({ include: { parent: true }, orderBy: { name: "asc" } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Categories</h1>
        <Link href="/admin/categories/new" className="rounded-full bg-ajrak px-4 py-2 text-sm text-cream">Add category</Link>
      </div>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="text-ink/50"><th className="py-2">Picture</th><th>Name</th><th>Parent</th><th>Status</th><th className="text-right">Actions</th></tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className="border-t border-ink/10">
              <td className="py-3">
                <AdminThumb src={category.imageUrl} spec="category" />
              </td>
              <td>{category.name}</td>
              <td>{category.parent?.name ?? "—"}</td>
              <td>{category.published ? "Published" : "Hidden"}</td>
              <td><RowActions editHref={`/admin/categories/${category.id}`} deleteAction={deleteCategory} id={category.id} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
