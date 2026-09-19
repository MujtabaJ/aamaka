import { pageMeta } from "@/lib/seo";
import { forgotPasswordSchema } from "@/lib/validations";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { issuePasswordReset } from "@/lib/password-reset";
import { Button, Field, inputClass } from "@/components/ui/primitives";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = pageMeta({
  title: "Forgot password",
  description: "Reset your AA Maka Production account password.",
  path: "/forgot-password",
});

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <p className="text-xs uppercase tracking-[0.28em] text-ajrak">Account</p>
      <h1 className="mt-3 font-display text-5xl">Forgot password</h1>
      <p className="mt-3 text-sm text-ink/70">
        Enter your email. If an account exists, we will send a reset link.
      </p>
      <form action={requestReset} className="mt-8 space-y-4 rounded-3xl bg-white p-6 shadow-soft">
        {sent ? <p className="text-sm text-sage">If that email is registered, a reset link is on its way.</p> : null}
        <Field label="Email">
          <input name="email" type="email" required className={inputClass} />
        </Field>
        <Button type="submit" variant="primary" className="w-full">
          Send reset link
        </Button>
      </form>
    </div>
  );
}

async function requestReset(form: FormData) {
  "use server";
  const limited = rateLimit(`forgot:${clientIp(await headers())}`, 5);
  if (!limited.ok) redirect("/forgot-password?sent=1");
  const parsed = forgotPasswordSchema.safeParse({ email: form.get("email") });
  if (parsed.success) await issuePasswordReset(parsed.data.email);
  redirect("/forgot-password?sent=1");
}
