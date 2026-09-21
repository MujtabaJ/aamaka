import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { formatMoney } from "@/lib/money";
import { parseJson } from "@/lib/utils";
import { RowActions } from "@/components/admin/RowActions";
import { deleteProduct } from "@/app/admin/actions";

export default async function AdminProductsPage() {
  await requirePermission("products.manage");
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Products</h1>
        <Link href="/admin/products/new" className="rounded-full bg-ajrak px-4 py-2 text-sm text-cream">Add product</Link>
      </div>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="text-ink/50">
            <th className="py-2">Picture</th>
            <th>Name</th>
            <th>SKU</th>
            <th>Stock</th>
            <th>Price</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const image = parseJson<string[]>(product.images, [])[0];
            return (
              <tr key={product.id} className="border-t border-ink/10">
                <td className="py-3">
                  <div className="h-14 w-14 rounded-2xl bg-ink/10 bg-cover bg-center" style={{ backgroundImage: image ? `url(${image})` : undefined }} />
                </td>
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td className={product.stock <= product.lowStockAt ? "text-ajrak" : ""}>{product.stock}</td>
                <td>{formatMoney(product.pricePaisa)}</td>
                <td><RowActions editHref={`/admin/products/${product.id}`} deleteAction={deleteProduct} id={product.id} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
