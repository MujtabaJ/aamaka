import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { RowActions } from "@/components/admin/RowActions";
import { deleteUser } from "@/app/admin/entity-actions";

export default async function AdminUsersPage() {
  await requirePermission("users.manage");
  const users = await prisma.user.findMany({ include: { role: true }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Users & roles</h1>
        <Link href="/admin/users/new" className="rounded-full bg-ajrak px-4 py-2 text-sm text-cream">Add user</Link>
      </div>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="text-ink/50"><th className="py-2">Picture</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th className="text-right">Actions</th></tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-ink/10">
              <td className="py-3">
                <div className="h-14 w-14 rounded-2xl bg-ink/10 bg-cover bg-center" style={{ backgroundImage: user.image ? `url(${user.image})` : undefined }} />
              </td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role.label}</td>
              <td>{user.status}</td>
              <td><RowActions editHref={`/admin/users/${user.id}`} deleteAction={deleteUser} id={user.id} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
