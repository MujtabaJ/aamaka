import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import bcrypt from "bcryptjs";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { revalidatePath } from "next/cache";

export default async function AdminUsersPage() {
  await requirePermission("users.manage");
  const [users, roles] = await Promise.all([
    prisma.user.findMany({ include: { role: true }, orderBy: { createdAt: "desc" } }),
    prisma.role.findMany(),
  ]);
  async function create(form: FormData) {
    "use server";
    await requirePermission("users.manage");
    await prisma.user.create({
      data: {
        name: String(form.get("name")),
        email: String(form.get("email")).toLowerCase(),
        passwordHash: await bcrypt.hash(String(form.get("password")), 12),
        roleId: String(form.get("roleId")),
      },
    });
    revalidatePath("/admin/users");
  }
  return (
    <div>
      <h1 className="font-display text-4xl">Users & roles</h1>
      <form action={create} className="mt-6 grid gap-3 rounded-3xl bg-white p-5 md:grid-cols-2">
        <Field label="Name"><input name="name" required className={inputClass} /></Field>
        <Field label="Email"><input name="email" type="email" required className={inputClass} /></Field>
        <Field label="Password"><input name="password" type="password" required className={inputClass} /></Field>
        <Field label="Role">
          <select name="roleId" className={inputClass}>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </Field>
        <Button type="submit">Create user</Button>
      </form>
      <ul className="mt-6 space-y-2 text-sm">
        {users.map((u) => (
          <li key={u.id} className="rounded-2xl bg-white p-4">{u.name} · {u.email} · {u.role.label}</li>
        ))}
      </ul>
    </div>
  );
}
