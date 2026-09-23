import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { pageMeta, jsonLd, siteUrl } from "@/lib/seo";
import { formatMoney, effectivePrice } from "@/lib/money";
import { Button } from "@/components/ui/primitives";
import { PlayButton } from "@/components/music/PlayButton";
import type { Metadata } from "next";
import { freshSrc } from "@/lib/image-specs";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const album = await prisma.album.findUnique({ where: { slug }, include: { artist: true } });
  if (!album) return pageMeta({ title: "Album", description: "AA Maka album" });
  return pageMeta({
    title: album.seoTitle || album.title,
    description: album.seoDescription || album.description,
    path: `/music/album/${album.slug}`,
    image: album.coverUrl,
  });
}

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await prisma.album.findUnique({
    where: { slug },
    include: {
      artist: true,
      genre: true,
      tracks: { include: { song: { include: { artist: true } } }, orderBy: { position: "asc" } },
    },
  });
  if (!album || !album.published) notFound();
  const price = effectivePrice(album.pricePaisa, album.salePricePaisa);

  return (
    <div className="mx-auto max-w-page px-4 py-16 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "MusicAlbum",
          name: album.title,
          byArtist: album.artist?.name,
          url: siteUrl(`/music/album/${album.slug}`),
          image: album.coverUrl,
        })}
      />
      <div className="grid gap-10 md:grid-cols-[280px_1fr]">
        <div className="aspect-square rounded-3xl bg-cover bg-center" style={{ backgroundImage: album.coverUrl ? `url(${freshSrc(album.coverUrl, album.updatedAt)})` : undefined }} />
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-ajrak">{album.genre?.name || "Album"}</p>
          <h1 className="mt-2 font-display text-5xl">{album.title}</h1>
          <p className="mt-3 text-ink/70">{album.artist?.name}</p>
          <p className="mt-5 max-w-xl text-ink/75">{album.description}</p>
          <p className="mt-6 text-2xl">{formatMoney(price)}</p>
          <form action="/api/cart/add" method="post" className="mt-6">
            <input type="hidden" name="kind" value="album" />
            <input type="hidden" name="albumId" value={album.id} />
            <Button type="submit" variant="primary">
              Buy album
            </Button>
          </form>
        </div>
      </div>
      <ol className="mt-12 divide-y divide-ink/10 rounded-3xl bg-white">
        {album.tracks.map((track, i) => (
          <li key={track.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-sm text-ink/40">{String(i + 1).padStart(2, "0")}</p>
              <a href={`/music/song/${track.song.slug}`} className="font-display text-xl">
                {track.song.title}
              </a>
            </div>
            <PlayButton
              song={{
                id: track.song.id,
                title: track.song.title,
                artist: track.song.artist.name,
                coverUrl: track.song.coverUrl,
                accessType: track.song.accessType,
                exclusive: track.song.exclusive,
                albumId: album.id,
              }}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
