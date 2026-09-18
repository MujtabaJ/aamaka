import Link from "next/link";
import { requireStaff } from "@/lib/session";
import { signOut } from "@/lib/auth";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/music", label: "Music" },
  { href: "/admin/albums", label: "Albums" },
  { href: "/admin/artists", label: "Artists" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/books", label: "Books" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/memberships", label: "Memberships" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/media", label: "Media library" },
  { href: "/admin/users", label: "Users & roles" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  return (
    <div className="min-h-screen bg-[#f3eee6] text-ink">
      <div className="grid min-h-screen lg:grid-cols-[240px_1fr]">
        <aside className="border-r border-ink/10 bg-ink text-cream">
          <div className="px-5 py-6">
            <p className="font-display text-2xl">AA Maka</p>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Admin</p>
          </div>
          <nav className="grid gap-1 px-3 pb-8 text-sm">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-xl px-3 py-2 text-cream/80 hover:bg-white/5 hover:text-gold">
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div>
          <header className="flex items-center justify-between border-b border-ink/10 bg-white px-6 py-4">
            <form action="/search">
              <input name="q" placeholder="Search site" className="w-64 rounded-full border border-ink/10 px-4 py-2 text-sm" />
            </form>
            <div className="flex items-center gap-3 text-sm">
              <Link href="/admin/music/new" className="rounded-full bg-ajrak px-3 py-1.5 text-cream">
                Quick add song
              </Link>
              <Link href="/admin/notifications">Alerts</Link>
              <span>{user.name}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button>Sign out</button>
              </form>
            </div>
          </header>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
