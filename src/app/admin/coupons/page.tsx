import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { revalidatePath } from "next/cache";

export default async function AdminCouponsPage() {
  await requirePermission("coupons.manage");
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  async function create(form: FormData) {
    "use server";
    await requirePermission("coupons.manage");
    await prisma.coupon.create({
      data: {
        code: String(form.get("code")).toUpperCase(),
        type: String(form.get("type")),
        value: Number(form.get("value")),
        minOrderPaisa: Math.round(Number(form.get("minOrder") || 0) * 100),
        memberOnly: form.get("memberOnly") === "on",
        firstOrderOnly: form.get("firstOrderOnly") === "on",
        usageLimit: form.get("usageLimit") ? Number(form.get("usageLimit")) : null,
        active: true,
      },
    });
    revalidatePath("/admin/coupons");
  }
  return (
    <div>
      <h1 className="font-display text-4xl">Coupons</h1>
      <form action={create} className="mt-6 grid gap-3 rounded-3xl bg-white p-5 md:grid-cols-2">
        <Field label="Code"><input name="code" required className={inputClass} /></Field>
        <Field label="Type">
          <select name="type" className={inputClass}>
            <option value="percent">Percent</option>
            <option value="fixed">Fixed (paisa-based rupees)</option>
          </select>
        </Field>
        <Field label="Value"><input name="value" type="number" required className={inputClass} /></Field>
        <Field label="Min order (PKR)"><input name="minOrder" type="number" className={inputClass} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="memberOnly" /> Member only</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="firstOrderOnly" /> First order</label>
        <Button type="submit">Create coupon</Button>
      </form>
      <ul className="mt-6 space-y-2">
        {coupons.map((c) => (
          <li key={c.id} className="rounded-2xl bg-white p-4 text-sm">{c.code} · {c.type} {c.value} · {c.active ? "active" : "off"}</li>
        ))}
      </ul>
    </div>
  );
}
