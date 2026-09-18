"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Field, inputClass } from "@/components/ui/primitives";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError("Email or password is incorrect.");
      return;
    }
    router.push(params.get("callbackUrl") || "/account");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <Field label="Email">
        <input name="email" type="email" required className={inputClass} />
      </Field>
      <Field label="Password">
        <input name="password" type="password" required className={inputClass} />
      </Field>
      {error ? <p className="text-sm text-ajrak">{error}</p> : null}
      <Button type="submit" variant="primary" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-ink/60">
        New here? <Link href="/register" className="text-ajrak">Create an account</Link>
      </p>
    </form>
  );
}
