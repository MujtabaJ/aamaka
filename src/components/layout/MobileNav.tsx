"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown, Home, Library, ShoppingBag, UserRound } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

export function MobileNav({ dict }: { dict: Dictionary }) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: dict.nav.home, icon: Home },
    { href: "/music", label: dict.nav.music, icon: Library },
    { href: "/shop", label: dict.nav.shop, icon: ShoppingBag },
    { href: "/membership", label: dict.nav.membership, icon: Crown },
    { href: "/account", label: dict.nav.account, icon: UserRound },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-cream/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-[11px]",
                active ? "text-ajrak" : "text-ink/60",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
