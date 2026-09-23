import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { deleteUser, saveUser } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";
import { DeleteButton } from "@/components/admin/RowActions";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("users.manage");
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();
  const roles = await prisma.role.findMany();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/users" className="text-sm text-ajrak">Back to users</Link>
      <h1 className="mt-3 font-display text-4xl">Edit {user.name}</h1>
      <form action={saveUser} className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <input type="hidden" name="id" value={user.id} />
        <PicturePicker spec="avatar" label="Profile picture" current={user.image} />
        <Field label="Name"><input name="name" defaultValue={user.name} required className={inputClass} /></Field>
        <Field label="Email"><input name="email" type="email" defaultValue={user.email} required className={inputClass} /></Field>
        <Field label="New password (optional)"><input name="password" type="password" className={inputClass} /></Field>
        <Field label="Phone"><input name="phone" defaultValue={user.phone ?? ""} className={inputClass} /></Field>
        <Field label="Role">
          <select name="roleId" defaultValue={user.roleId} className={inputClass}>
            {roles.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={user.status} className={inputClass}>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </Field>
        <Button type="submit">Save changes</Button>
      </form>
      <div className="mt-4"><DeleteButton action={deleteUser} id={user.id} label="Delete user" /></div>
    </div>
  );
}
