import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { formatMoney } from "@/lib/money";

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
        <thead><tr className="text-ink/50"><th className="py-2">Name</th><th>SKU</th><th>Stock</th><th>Price</th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t border-ink/10">
              <td className="py-3"><Link href={`/admin/products/${p.id}`}>{p.name}</Link></td>
              <td>{p.sku}</td>
              <td className={p.stock <= p.lowStockAt ? "text-ajrak" : ""}>{p.stock}</td>
              <td>{formatMoney(p.pricePaisa)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
