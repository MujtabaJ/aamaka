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
  async function update(form: FormData) {
    "use server";
    await requirePermission("users.manage");
    const id = String(form.get("id"));
    if (form.get("action") === "delete") {
      await prisma.user.update({ where: { id }, data: { status: "disabled" } });
    } else {
      const password = String(form.get("password") || "");
      await prisma.user.update({
        where: { id },
        data: {
          name: String(form.get("name")),
          email: String(form.get("email")).toLowerCase(),
          roleId: String(form.get("roleId")),
          status: String(form.get("status") || "active"),
          ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
        },
      });
    }
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
      <ul className="mt-6 space-y-3 text-sm">
        {users.map((u) => (
          <li key={u.id} className="rounded-2xl bg-white p-4">
            <form action={update} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={u.id} />
              <Field label="Name"><input name="name" defaultValue={u.name} className={inputClass} /></Field>
              <Field label="Email"><input name="email" type="email" defaultValue={u.email} className={inputClass} /></Field>
              <Field label="Role">
                <select name="roleId" defaultValue={u.roleId} className={inputClass}>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select name="status" defaultValue={u.status} className={inputClass}>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </Field>
              <Field label="New password (optional)"><input name="password" type="password" className={inputClass} /></Field>
              <div className="flex items-end gap-3">
                <Button type="submit">Save</Button>
                <button name="action" value="delete" className="text-ajrak">Delete</button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
