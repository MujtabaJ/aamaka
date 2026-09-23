import { Suspense } from "react";
import { requireStaff } from "@/lib/session";
import { signOut } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminFlash } from "@/components/admin/AdminFlash";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  return (
    <AdminShell userName={user.name ?? "Admin"} signOutAction={signOutAction}>
      <Suspense fallback={null}>
        <AdminFlash />
      </Suspense>
      {children}
    </AdminShell>
  );
}
