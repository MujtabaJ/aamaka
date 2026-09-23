import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { saveUser } from "@/app/admin/entity-actions";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { PicturePicker } from "@/components/admin/PicturePicker";

export default async function NewUserPage() {
  await requirePermission("users.manage");
  const roles = await prisma.role.findMany();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/users" className="text-sm text-ajrak">Back to users</Link>
      <h1 className="mt-3 font-display text-4xl">Add user</h1>
      <form action={saveUser} encType="multipart/form-data" className="mt-6 space-y-4 rounded-3xl bg-white p-6">
        <PicturePicker spec="avatar" label="Profile picture" />
        <Field label="Name"><input name="name" required className={inputClass} /></Field>
        <Field label="Email"><input name="email" type="email" required className={inputClass} /></Field>
        <Field label="Password"><input name="password" type="password" required className={inputClass} /></Field>
        <Field label="Phone"><input name="phone" className={inputClass} /></Field>
        <Field label="Role">
          <select name="roleId" className={inputClass}>
            {roles.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
          </select>
        </Field>
        <Button type="submit">Save user</Button>
      </form>
    </div>
  );
}
