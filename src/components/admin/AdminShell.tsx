"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/media", label: "Media library" },
  { href: "/admin/users", label: "Users & roles" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({
  userName,
  children,
  signOutAction,
}: {
  userName: string;
  children: React.ReactNode;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-[#f3eee6] text-ink">
      <div className="lg:grid lg:min-h-dvh lg:grid-cols-[240px_1fr]">
        {open ? (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-ink/50 lg:hidden"
            onClick={() => setOpen(false)}
          />
        ) : null}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto bg-ink text-cream transition-transform lg:static lg:z-0 lg:w-auto lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <div>
              <p className="font-display text-2xl">AA Maka</p>
              <p className="text-xs uppercase tracking-[0.2em] text-gold">Admin</p>
            </div>
            <button type="button" className="rounded-full p-2 lg:hidden" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="grid gap-1 px-3 pb-8 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-cream/80 hover:bg-white/5 hover:text-gold",
                  pathname === item.href && "bg-white/10 text-gold",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-white px-4 py-3 md:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                className="rounded-full border border-ink/15 p-2 lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <form action="/search" className="min-w-0 flex-1">
                <input
                  name="q"
                  placeholder="Search site"
                  className="w-full max-w-xs rounded-full border border-ink/10 px-4 py-2 text-sm"
                />
              </form>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 text-sm sm:gap-3">
              <Link href="/admin/music/new" className="rounded-full bg-ajrak px-3 py-1.5 text-cream">
                Quick add song
              </Link>
              <Link href="/admin/notifications">Alerts</Link>
              <span className="hidden max-w-[10rem] truncate sm:inline">{userName}</span>
              <form action={signOutAction}>
                <button>Sign out</button>
              </form>
            </div>
          </header>
          <div className="admin-content overflow-x-auto p-4 md:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
