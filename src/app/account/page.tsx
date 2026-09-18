import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { revalidatePath } from "next/cache";

export const metadata = pageMeta({ title: "Account", description: "Your AA Maka account.", path: "/account" });

export default async function AccountPage() {
  const user = await requireUser();
  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  return (
    <div>
      <h1 className="font-display text-4xl">Profile</h1>
      <form action={updateProfile.bind(null, user.id)} className="mt-6 max-w-lg space-y-4 rounded-3xl bg-white p-6">
        <Field label="Name">
          <input name="name" defaultValue={dbUser.name} className={inputClass} />
        </Field>
        <Field label="Phone">
          <input name="phone" defaultValue={dbUser.phone ?? ""} className={inputClass} />
        </Field>
        <p className="text-sm text-ink/60">{dbUser.email}</p>
        <Button type="submit" variant="primary">
          Save
        </Button>
      </form>
    </div>
  );
}

async function updateProfile(userId: string, form: FormData) {
  "use server";
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? "") || null,
    },
  });
  revalidatePath("/account");
}
