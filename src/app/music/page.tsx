import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { SongCard } from "@/components/music/SongCard";
import { EmptyState } from "@/components/ui/primitives";
import { getHomepageSection } from "@/lib/homepage";
import { PageHero } from "@/components/content/PageHero";
import type { Metadata } from "next";

export const metadata: Metadata = pageMeta({
  title: "Sindhi Songs",
  description: "Sindhi Sufi music, folk songs, qawwali and new releases from AA Maka Production.",
  path: "/music",
});

export default async function MusicPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string; artist?: string; sort?: string; lang?: string }>;
}) {
  const params = await searchParams;
  const where = {
    published: true,
    accessType: { not: "hidden" },
    ...(params.genre ? { genre: { slug: params.genre } } : {}),
    ...(params.artist ? { artist: { slug: params.artist } } : {}),
    ...(params.lang ? { language: params.lang } : {}),
    ...(params.q
      ? {
          OR: [
            { title: { contains: params.q } },
            { titleSd: { contains: params.q } },
            { singer: { contains: params.q } },
          ],
        }
      : {}),
  };
  const [songs, genres, artists, section] = await Promise.all([
    prisma.song.findMany({
      where,
      include: { artist: true, genre: true },
      orderBy:
        params.sort === "popular" ? { playCount: "desc" } : { createdAt: "desc" },
      take: 48,
    }),
    prisma.genre.findMany({ where: { published: true } }),
    prisma.artist.findMany({ where: { published: true }, orderBy: { name: "asc" } }),
    getHomepageSection("music"),
  ]);
  const queue = songs.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    artist: s.artist.name,
    coverUrl: s.coverUrl,
    accessType: s.accessType,
    exclusive: s.exclusive,
    albumId: s.albumId,
    genre: s.genre?.name,
    shortDescription: s.shortDescription,
  }));

  return (
    <div className="mx-auto max-w-page px-4 py-12 md:px-6">
      <PageHero section={section} fallbackTitle="Sindhi music" />
      <form className="mt-8 grid gap-3 rounded-3xl bg-white p-4 shadow-soft md:grid-cols-5">
        <input name="q" defaultValue={params.q} placeholder="Search songs" className="rounded-xl border border-ink/10 px-3 py-2 text-sm md:col-span-2" />
        <select name="genre" defaultValue={params.genre} className="rounded-xl border border-ink/10 px-3 py-2 text-sm">
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.slug}>
              {g.name}
            </option>
          ))}
        </select>
        <select name="artist" defaultValue={params.artist} className="rounded-xl border border-ink/10 px-3 py-2 text-sm">
          <option value="">All artists</option>
          {artists.map((a) => (
            <option key={a.id} value={a.slug}>
              {a.name}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={params.sort} className="rounded-xl border border-ink/10 px-3 py-2 text-sm">
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
        </select>
        <button className="rounded-full bg-ink px-4 py-2 text-sm text-cream md:col-span-5">Filter</button>
      </form>
      {songs.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No songs match" body="Try another artist, genre or spelling." />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {songs.map((song) => (
            <SongCard key={song.id} song={queue.find((q) => q.id === song.id)!} queue={queue} />
          ))}
        </div>
      )}
    </div>
  );
}
