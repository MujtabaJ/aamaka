import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { revalidatePath } from "next/cache";

export default async function AddressesPage() {
  const user = await requireUser();
  const addresses = await prisma.address.findMany({ where: { userId: user.id } });
  return (
    <div>
      <h1 className="font-display text-4xl">Addresses</h1>
      <div className="mt-6 space-y-3">
        {addresses.length === 0 ? <p className="text-sm text-ink/60">No saved addresses yet.</p> : null}
        {addresses.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-2xl bg-white p-4 text-sm">
            <p>
              {a.fullName}, {a.line1}, {a.city}
            </p>
            <form action={removeAddress}>
              <input type="hidden" name="id" value={a.id} />
              <button className="text-ajrak">Remove</button>
            </form>
          </div>
        ))}
      </div>
      <form action={addAddress.bind(null, user.id)} className="mt-8 max-w-lg space-y-3 rounded-3xl bg-white p-6">
        <Field label="Full name">
          <input name="fullName" required className={inputClass} />
        </Field>
        <Field label="Phone">
          <input name="phone" required className={inputClass} />
        </Field>
        <Field label="Address">
          <input name="line1" required className={inputClass} />
        </Field>
        <Field label="City">
          <input name="city" required className={inputClass} />
        </Field>
        <Field label="Province">
          <input name="province" defaultValue="Sindh" className={inputClass} />
        </Field>
        <Button type="submit">Save address</Button>
      </form>
    </div>
  );
}

async function addAddress(userId: string, form: FormData) {
  "use server";
  await prisma.address.create({
    data: {
      userId,
      fullName: String(form.get("fullName")),
      phone: String(form.get("phone")),
      line1: String(form.get("line1")),
      city: String(form.get("city")),
      province: String(form.get("province") || "Sindh"),
    },
  });
  revalidatePath("/account/addresses");
}

async function removeAddress(form: FormData) {
  "use server";
  const user = await requireUser();
  await prisma.address.deleteMany({
    where: { id: String(form.get("id")), userId: user.id },
  });
  revalidatePath("/account/addresses");
}
