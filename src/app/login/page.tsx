import { Suspense } from "react";
import { pageMeta } from "@/lib/seo";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = pageMeta({
  title: "Sign in",
  description: "Sign in to AA Maka Production to manage membership, library and orders.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <p className="text-xs uppercase tracking-[0.28em] text-ajrak">Welcome back</p>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">Sign in</h1>
      <p className="mt-3 text-sm text-ink/70">
        Members can play full tracks. Purchasers keep album access in My Library.
      </p>
      <div className="mt-8 rounded-3xl bg-white p-6 shadow-soft">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
