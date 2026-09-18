import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { SongCard } from "@/components/music/SongCard";
import { AlbumCard } from "@/components/music/AlbumCard";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const genre = await prisma.genre.findUnique({ where: { slug } });
  if (!genre) return pageMeta({ title: "Genre", description: "Sindhi music genres" });
  return pageMeta({
    title: genre.name,
    description: genre.description || `${genre.name} from AA Maka Production`,
    path: `/music/genre/${genre.slug}`,
  });
}

export default async function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const genre = await prisma.genre.findUnique({
    where: { slug },
    include: {
      songs: { where: { published: true }, include: { artist: true, genre: true }, take: 24 },
      albums: { where: { published: true }, include: { artist: true, tracks: true } },
    },
  });
  if (!genre) notFound();
  const queue = genre.songs.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    artist: s.artist.name,
    coverUrl: s.coverUrl,
    accessType: s.accessType,
    exclusive: s.exclusive,
    albumId: s.albumId,
    genre: genre.name,
    shortDescription: s.shortDescription,
  }));
  return (
    <div className="mx-auto max-w-page px-4 py-16 md:px-6">
      <p className="text-xs uppercase tracking-[0.28em] text-ajrak">Genre</p>
      <h1 className="mt-3 font-display text-5xl">{genre.name}</h1>
      <p className="mt-4 max-w-2xl text-ink/70">{genre.description}</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {genre.songs.map((song) => (
          <SongCard key={song.id} song={queue.find((q) => q.id === song.id)!} queue={queue} />
        ))}
      </div>
      {genre.albums.length ? (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {genre.albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
