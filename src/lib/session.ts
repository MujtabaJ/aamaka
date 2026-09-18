import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isStaffRole, type PermissionKey } from "@/lib/rbac";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireStaff() {
  const user = await requireUser();
  if (!isStaffRole(user.role)) redirect("/");
  return user;
}

export async function requirePermission(permission: PermissionKey) {
  const user = await requireStaff();
  if (user.role === "SUPER_ADMIN") return user;
  if (!user.permissions.includes(permission)) redirect("/admin");
  return user;
}

export async function currentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function csrfOk(form: FormData) {
  const jar = await cookies();
  const cookie = jar.get("aamaka_csrf")?.value;
  const token = String(form.get("csrf") ?? "");
  return Boolean(cookie && token && cookie === token);
}
