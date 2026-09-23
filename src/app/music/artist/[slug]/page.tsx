import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { parseJson } from "@/lib/utils";
import { SongCard } from "@/components/music/SongCard";
import { AlbumCard } from "@/components/music/AlbumCard";
import type { Metadata } from "next";
import { freshSrc } from "@/lib/image-specs";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const artist = await prisma.artist.findUnique({ where: { slug } });
  if (!artist) return pageMeta({ title: "Artist", description: "AA Maka artists" });
  return pageMeta({
    title: artist.seoTitle || artist.name,
    description: artist.seoDescription || artist.biography,
    path: `/music/artist/${artist.slug}`,
    image: artist.photoUrl,
  });
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await prisma.artist.findUnique({
    where: { slug },
    include: {
      songs: { where: { published: true }, include: { genre: true, artist: true }, take: 12 },
      albums: { where: { published: true }, include: { artist: true, tracks: true } },
    },
  });
  if (!artist) notFound();
  const socials = parseJson<Record<string, string>>(artist.socials, {});
  const queue = artist.songs.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    artist: artist.name,
    coverUrl: s.coverUrl,
    accessType: s.accessType,
    exclusive: s.exclusive,
    albumId: s.albumId,
    genre: s.genre?.name,
    shortDescription: s.shortDescription,
  }));

  return (
    <div>
      <div className="relative min-h-[50vh] bg-ink text-cream">
        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: artist.coverUrl ? `url(${freshSrc(artist.coverUrl, artist.updatedAt)})` : undefined }} />
        <div className="cinema-scrim absolute inset-0" />
        <div className="relative mx-auto flex min-h-[50vh] max-w-page items-end px-4 pb-12 md:px-6">
          <div className="flex items-end gap-5">
            {artist.photoUrl ? (
              <div
                className="h-28 w-28 shrink-0 rounded-3xl bg-cover bg-center shadow-soft md:h-36 md:w-36"
                style={{ backgroundImage: `url(${freshSrc(artist.photoUrl, artist.updatedAt)})` }}
              />
            ) : null}
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gold">Artist</p>
              <h1 className="font-display text-5xl md:text-7xl">{artist.name}</h1>
              {artist.nameSd ? <p className="mt-2 font-sindhi text-2xl">{artist.nameSd}</p> : null}
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-page px-4 py-12 md:px-6">
        <p className="max-w-3xl text-lg text-ink/75">{artist.biography}</p>
        <div className="mt-4 flex gap-4 text-sm">
          {socials.youtube ? <a href={socials.youtube}>YouTube</a> : null}
          {socials.facebook ? <a href={socials.facebook}>Facebook</a> : null}
          {socials.instagram ? <a href={socials.instagram}>Instagram</a> : null}
        </div>
        <h2 className="mt-12 font-display text-4xl">Songs</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {artist.songs.map((song) => (
            <SongCard key={song.id} song={queue.find((q) => q.id === song.id)!} queue={queue} />
          ))}
        </div>
        {artist.albums.length ? (
          <>
            <h2 className="mt-12 font-display text-4xl">Albums</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {artist.albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
