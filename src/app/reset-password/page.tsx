import { pageMeta } from "@/lib/seo";
import { resetPasswordSchema } from "@/lib/validations";
import { consumePasswordReset } from "@/lib/password-reset";
import { Button, Field, inputClass } from "@/components/ui/primitives";
import { redirect } from "next/navigation";

export const metadata = pageMeta({
  title: "Choose a new password",
  description: "Set a new password for your AA Maka Production account.",
  path: "/reset-password",
});

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <p className="text-xs uppercase tracking-[0.28em] text-ajrak">Account</p>
      <h1 className="mt-3 font-display text-5xl">New password</h1>
      <form action={resetAction} className="mt-8 space-y-4 rounded-3xl bg-white p-6 shadow-soft">
        <input type="hidden" name="token" value={token || ""} />
        {error ? <p className="text-sm text-ajrak">This reset link is invalid or has expired.</p> : null}
        <Field label="New password">
          <input name="password" type="password" minLength={8} required className={inputClass} />
        </Field>
        <Button type="submit" variant="primary" className="w-full" disabled={!token}>
          Update password
        </Button>
      </form>
    </div>
  );
}

async function resetAction(form: FormData) {
  "use server";
  const parsed = resetPasswordSchema.safeParse({
    token: form.get("token"),
    password: form.get("password"),
  });
  if (!parsed.success) redirect("/reset-password?error=1");
  const ok = await consumePasswordReset(parsed.data.token, parsed.data.password);
  redirect(ok ? "/login" : "/reset-password?error=1");
}
