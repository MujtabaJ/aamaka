import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { redirect } from "next/navigation";

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  return (
    <div>
      <h1 className="font-display text-4xl">Security</h1>
      {params.updated ? <p className="mt-3 text-sm text-sage">Password updated.</p> : null}
      {params.error ? <p className="mt-3 text-sm text-ajrak">Current password is incorrect.</p> : null}
      <form action={changePassword} className="mt-6 max-w-lg space-y-4 rounded-3xl bg-white p-6">
        <Field label="Current password">
          <input name="current" type="password" required className={inputClass} />
        </Field>
        <Field label="New password">
          <input name="next" type="password" minLength={8} required className={inputClass} />
        </Field>
        <Button type="submit">Update password</Button>
      </form>
    </div>
  );
}

async function changePassword(form: FormData) {
  "use server";
  const { requireUser } = await import("@/lib/session");
  const user = await requireUser();
  const db = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  const ok = await bcrypt.compare(String(form.get("current")), db.passwordHash);
  if (!ok) redirect("/account/security?error=1");
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(String(form.get("next")), 12) },
  });
  redirect("/account/security?updated=1");
}
