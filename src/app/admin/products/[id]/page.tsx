import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import { paisaToRupees } from "@/lib/money";
import { parseJson } from "@/lib/utils";
import { Field, inputClass, Button } from "@/components/ui/primitives";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("products.manage");
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();
  const categories = await prisma.productCategory.findMany();
  const imageUrls = parseJson<string[]>(product.images, []).join("\n");
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-4xl">Edit product</h1>
      <form action={saveProduct} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <input type="hidden" name="id" value={product.id} />
        <Field label="Name"><input name="name" defaultValue={product.name} className={inputClass} /></Field>
        <Field label="Sindhi name"><input name="nameSd" defaultValue={product.nameSd ?? ""} className={inputClass} /></Field>
        <Field label="SKU"><input name="sku" defaultValue={product.sku} className={inputClass} /></Field>
        <Field label="Category">
          <select name="categoryId" defaultValue={product.categoryId} className={inputClass}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Price (PKR)"><input name="price" type="number" defaultValue={paisaToRupees(product.pricePaisa)} className={inputClass} /></Field>
        <Field label="Sale price"><input name="salePrice" type="number" defaultValue={product.salePricePaisa ? paisaToRupees(product.salePricePaisa) : ""} className={inputClass} /></Field>
        <Field label="Stock"><input name="stock" type="number" defaultValue={product.stock} className={inputClass} /></Field>
        <Field label="Short description"><input name="shortDescription" defaultValue={product.shortDescription ?? ""} className={inputClass} /></Field>
        <Field label="Description"><textarea name="description" defaultValue={product.description} className={inputClass} /></Field>
        <Field label="Image URLs (one per line)"><textarea name="imageUrls" rows={4} defaultValue={imageUrls} className={inputClass} /></Field>
        <Field label="Upload replacement images"><input name="images" type="file" accept="image/*" multiple /></Field>
        <Field label="Shipping info"><input name="shippingInfo" defaultValue={product.shippingInfo ?? ""} className={inputClass} /></Field>
        <Field label="Status">
          <select name="status" defaultValue={product.status} className={inputClass}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={product.featured} /> Featured</label>
        <Button type="submit">Save</Button>
      </form>
      <form action={deleteProduct} className="mt-4">
        <input type="hidden" name="id" value={product.id} />
        <button className="text-sm text-ajrak">Archive this product</button>
      </form>
    </div>
  );
}
