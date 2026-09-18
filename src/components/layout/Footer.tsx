import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { SiteSettings } from "@/lib/settings";

export function Footer({ settings, dict }: { settings: SiteSettings; dict: Dictionary }) {
  return (
    <footer className="mt-10 border-t border-ink/10 bg-ink text-cream">
      <div className="mx-auto grid max-w-page gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <p className="font-display text-3xl">{settings.siteName}</p>
          <p className="mt-3 max-w-md text-sm text-cream/70">{settings.mission}</p>
          <form action="/api/newsletter" method="post" className="mt-6 flex max-w-md gap-2">
            <input
              name="email"
              type="email"
              required
              placeholder={dict.footer.newsletter}
              className="w-full rounded-full border border-cream/20 bg-transparent px-4 py-2.5 text-sm"
            />
            <button className="rounded-full bg-gold px-4 py-2 text-sm text-ink">Join</button>
          </form>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gold">Explore</p>
          <div className="mt-4 grid gap-2 text-sm text-cream/80">
            <Link href="/music">Music</Link>
            <Link href="/albums">Albums</Link>
            <Link href="/artists">Artists</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/books">Books</Link>
            <Link href="/membership">Membership</Link>
            <Link href="/stories">Stories</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gold">{dict.footer.policies}</p>
          <div className="mt-4 grid gap-2 text-sm text-cream/80">
            <Link href="/policies/privacy">Privacy</Link>
            <Link href="/policies/terms">Terms</Link>
            <Link href="/policies/refund">Refund</Link>
            <Link href="/policies/shipping">Shipping</Link>
            <Link href="/policies/membership">Membership Terms</Link>
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.24em] text-gold">{dict.footer.follow}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {settings.socials.youtube ? (
              <a href={settings.socials.youtube} target="_blank" rel="noreferrer">
                YouTube
              </a>
            ) : null}
            {settings.socials.facebook ? (
              <a href={settings.socials.facebook} target="_blank" rel="noreferrer">
                Facebook
              </a>
            ) : null}
            {settings.socials.tiktok ? (
              <a href={settings.socials.tiktok} target="_blank" rel="noreferrer">
                TikTok
              </a>
            ) : null}
            {settings.socials.instagram ? (
              <a href={settings.socials.instagram} target="_blank" rel="noreferrer">
                Instagram
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <div className="gold-rule" />
      <p className="px-4 py-6 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} AA Maka Production. All rights reserved.
        <span className="mx-2">·</span>
        Photographic backgrounds via Unsplash (illustrative).
      </p>
    </footer>
  );
}
