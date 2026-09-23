import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { saveProduct } from "@/app/admin/actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";
import { ImageSizeHint } from "@/components/admin/ImageSizeHint";

export default async function NewProductPage() {
  await requirePermission("products.manage");
  const categories = await prisma.productCategory.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="max-w-3xl">
      <Link href="/admin/products" className="text-sm text-ajrak">Back to products</Link>
      <h1 className="mt-3 font-display text-4xl">Add product</h1>
      <form action={saveProduct} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <PicturePicker spec="product" label="Product picture" fileName="photoFile" urlName="photoUrl" />
        <Field label="Name"><input name="name" required className={inputClass} /></Field>
        <Field label="Sindhi name"><input name="nameSd" className={inputClass} /></Field>
        <Field label="SKU"><input name="sku" required className={inputClass} /></Field>
        <Field label="Category">
          <select name="categoryId" required className={inputClass}>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </Field>
        <Field label="Price (PKR)"><input name="price" type="number" required className={inputClass} /></Field>
        <Field label="Sale price"><input name="salePrice" type="number" className={inputClass} /></Field>
        <Field label="Stock"><input name="stock" type="number" defaultValue={10} className={inputClass} /></Field>
        <Field label="Short description"><input name="shortDescription" className={inputClass} /></Field>
        <Field label="Description"><textarea name="description" required className={inputClass} /></Field>
        <Field label="Extra image URLs (one per line)">
          <textarea name="imageUrls" rows={3} className={inputClass} />
          <ImageSizeHint spec="product" />
        </Field>
        <Field label="Shipping info"><input name="shippingInfo" className={inputClass} /></Field>
        <Field label="Status">
          <select name="status" className={inputClass}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" /> Featured</label>
        <Button type="submit">Save product</Button>
      </form>
    </div>
  );
}
