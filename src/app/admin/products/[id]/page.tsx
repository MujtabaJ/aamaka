import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import { paisaToRupees } from "@/lib/money";
import { parseJson } from "@/lib/utils";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";
import { DeleteButton } from "@/components/admin/RowActions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("products.manage");
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();
  const categories = await prisma.productCategory.findMany();
  const images = parseJson<string[]>(product.images, []);
  return (
    <div className="max-w-3xl">
      <Link href="/admin/products" className="text-sm text-ajrak">Back to products</Link>
      <h1 className="mt-3 font-display text-4xl">Edit {product.name}</h1>
      <form action={saveProduct} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <input type="hidden" name="id" value={product.id} />
        <PicturePicker label="Product picture" fileName="photoFile" urlName="photoUrl" current={images[0]} />
        <Field label="Name"><input name="name" defaultValue={product.name} className={inputClass} /></Field>
        <Field label="Sindhi name"><input name="nameSd" defaultValue={product.nameSd ?? ""} className={inputClass} /></Field>
        <Field label="SKU"><input name="sku" defaultValue={product.sku} className={inputClass} /></Field>
        <Field label="Category">
          <select name="categoryId" defaultValue={product.categoryId} className={inputClass}>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </Field>
        <Field label="Price (PKR)"><input name="price" type="number" defaultValue={paisaToRupees(product.pricePaisa)} className={inputClass} /></Field>
        <Field label="Sale price"><input name="salePrice" type="number" defaultValue={product.salePricePaisa ? paisaToRupees(product.salePricePaisa) : ""} className={inputClass} /></Field>
        <Field label="Stock"><input name="stock" type="number" defaultValue={product.stock} className={inputClass} /></Field>
        <Field label="Short description"><input name="shortDescription" defaultValue={product.shortDescription ?? ""} className={inputClass} /></Field>
        <Field label="Description"><textarea name="description" defaultValue={product.description} className={inputClass} /></Field>
        <Field label="Extra image URLs (one per line)"><textarea name="imageUrls" rows={4} defaultValue={images.slice(1).join("\n")} className={inputClass} /></Field>
        <Field label="Shipping info"><input name="shippingInfo" defaultValue={product.shippingInfo ?? ""} className={inputClass} /></Field>
        <Field label="Status">
          <select name="status" defaultValue={product.status} className={inputClass}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={product.featured} /> Featured</label>
        <Button type="submit">Save changes</Button>
      </form>
      <div className="mt-4"><DeleteButton action={deleteProduct} id={product.id} label="Delete product" /></div>
    </div>
  );
}
