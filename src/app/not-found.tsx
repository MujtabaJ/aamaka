import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">404</p>
      <h1 className="mt-4 font-display text-5xl">This page is not in the archive</h1>
      <p className="mt-4 text-ink/70">Return to the music, the shop, or the studio story.</p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-ajrak px-5 py-2 text-cream">
        Home
      </Link>
    </div>
  );
}
