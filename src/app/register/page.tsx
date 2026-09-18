import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { notify, templates } from "@/lib/notifications";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { Button, Field, inputClass } from "@/components/ui/primitives";
import { pageMeta } from "@/lib/seo";
import { headers } from "next/headers";

export const metadata = pageMeta({
  title: "Create account",
  description: "Join AA Maka Production for Sindhi music, memberships and cultural products.",
  path: "/register",
});

export default function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <p className="text-xs uppercase tracking-[0.28em] text-ajrak">Join the archive</p>
      <h1 className="mt-3 font-display text-5xl">Create account</h1>
      <form action={registerAction} className="mt-8 space-y-4 rounded-3xl bg-white p-6 shadow-soft">
        <Field label="Full name">
          <input name="name" required className={inputClass} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required className={inputClass} />
        </Field>
        <Field label="Phone">
          <input name="phone" className={inputClass} />
        </Field>
        <Field label="Password">
          <input name="password" type="password" minLength={8} required className={inputClass} />
        </Field>
        <ErrorNote searchParams={searchParams} />
        <Button type="submit" variant="primary" className="w-full">
          Create account
        </Button>
      </form>
    </div>
  );
}

async function ErrorNote({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  if (!error) return null;
  return <p className="text-sm text-ajrak">{error}</p>;
}

async function registerAction(form: FormData) {
  "use server";
  const ip = clientIp(await headers());
  const limited = rateLimit(`register:${ip}`, 8);
  if (!limited.ok) redirect("/register?error=Too%20many%20attempts");
  const parsed = registerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect("/register?error=Please%20check%20your%20details");
  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (exists) redirect("/register?error=An%20account%20already%20exists");
  const role = await prisma.role.findUnique({ where: { name: "CUSTOMER" } });
  if (!role) redirect("/register?error=Setup%20incomplete");
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      roleId: role.id,
    },
  });
  await notify({ ...templates.welcome(user.name), userId: user.id });
  await notify({
    audience: "admin",
    type: "new_customer",
    title: "New customer",
    body: `${user.name} (${user.email}) created an account.`,
    href: `/admin/customers`,
  });
  redirect("/login");
}
