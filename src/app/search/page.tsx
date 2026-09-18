import { searchAll } from "@/lib/data";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";

export const metadata = pageMeta({
  title: "Search",
  description: "Search Sindhi songs, albums, artists and cultural products.",
  path: "/search",
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = await searchAll(q);
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-display text-5xl">Search</h1>
      <form className="mt-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Sindhi songs, ajrak, artists…"
          className="w-full rounded-full border border-ink/15 bg-white px-5 py-3"
        />
      </form>
      {q ? (
        <div className="mt-10 space-y-8">
          <ResultGroup title="Songs" items={results.songs.map((s) => ({ href: `/music/song/${s.slug}`, label: s.title }))} />
          <ResultGroup title="Albums" items={results.albums.map((s) => ({ href: `/music/album/${s.slug}`, label: s.title }))} />
          <ResultGroup title="Artists" items={results.artists.map((s) => ({ href: `/music/artist/${s.slug}`, label: s.name }))} />
          <ResultGroup title="Shop" items={results.products.map((s) => ({ href: `/shop/${s.slug}`, label: s.name }))} />
          <ResultGroup title="Books" items={results.books.map((s) => ({ href: `/books/${s.slug}`, label: s.title }))} />
          <ResultGroup title="Stories" items={results.articles.map((s) => ({ href: `/stories/${s.slug}`, label: s.title }))} />
        </div>
      ) : (
        <p className="mt-8 text-ink/60">Search across English and Sindhi titles where they have been entered.</p>
      )}
    </div>
  );
}

function ResultGroup({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="text-xs uppercase tracking-[0.2em] text-ajrak">{title}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="font-display text-2xl hover:text-ajrak">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
