import Link from "next/link";
import { requireUser } from "@/lib/session";
import { signOut } from "@/lib/auth";

const links = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/library", label: "Digital library" },
  { href: "/account/membership", label: "Membership" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/notifications", label: "Notifications" },
  { href: "/account/security", label: "Security" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="mx-auto grid max-w-page gap-8 px-4 py-12 md:grid-cols-[220px_1fr] md:px-6">
      <aside className="h-fit rounded-3xl bg-white p-4">
        <p className="px-2 text-xs uppercase tracking-[0.2em] text-ajrak">Account</p>
        <nav className="mt-3 grid gap-1 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-xl px-2 py-2 hover:bg-cream">
              {l.label}
            </Link>
          ))}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="w-full rounded-xl px-2 py-2 text-left text-ajrak">Logout</button>
          </form>
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
