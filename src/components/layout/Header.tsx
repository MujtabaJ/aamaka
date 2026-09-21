"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import type { Dictionary, Locale } from "@/i18n/dictionaries";
import type { SiteSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";

export function navLinks(dict: Dictionary) {
  return [
    { href: "/", label: dict.nav.home },
    { href: "/music", label: dict.nav.music },
    { href: "/albums", label: dict.nav.albums },
    { href: "/artists", label: dict.nav.artists },
    { href: "/shop", label: dict.nav.shop },
    { href: "/books", label: dict.nav.books },
    { href: "/membership", label: dict.nav.membership },
    { href: "/stories", label: dict.nav.stories },
    { href: "/about", label: dict.nav.about },
  ];
}

export function Header({
  settings,
  dict,
  locale,
}: {
  settings: SiteSettings;
  dict: Dictionary;
  locale: Locale;
}) {
  const pathname = usePathname();
  const { data } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-display text-lg text-gold">
            AA
          </span>
          <span className="leading-tight">
            <span className="block max-w-[9.5rem] truncate font-display text-base sm:max-w-none sm:text-lg md:text-xl">{settings.siteName}</span>
            <span className="hidden text-[11px] uppercase tracking-[0.22em] text-ink/50 sm:block">
              Music · Culture · Heritage
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 lg:flex">
          {navLinks(dict).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm text-ink/70 transition hover:text-ajrak",
                pathname === l.href && "text-ajrak",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitch locale={locale} />
          <Link href="/search" className="rounded-full p-2 hover:bg-ink/5" aria-label="Search">
            <Search className="h-4 w-4" />
          </Link>
          <Link href="/cart" className="rounded-full p-2 hover:bg-ink/5" aria-label="Cart">
            <ShoppingBag className="h-4 w-4" />
          </Link>
          {data?.user ? (
            <Link
              href={data.user.isStaff ? "/admin" : "/account"}
              className="rounded-full p-2 hover:bg-ink/5"
            >
              <UserRound className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full border border-ink/15 px-3 py-1.5 text-sm sm:inline"
            >
              Sign in
            </Link>
          )}
          <button className="rounded-full p-2 lg:hidden" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-ink/10 bg-cream px-4 py-4 lg:hidden">
          <div className="grid gap-3">
            {navLinks(dict).map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-base">
                {l.label}
              </Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)}>
              {dict.nav.contact}
            </Link>
            {data?.user ? (
              <button className="text-left text-ajrak" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </button>
            ) : (
              <Link href="/login">Sign in</Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
