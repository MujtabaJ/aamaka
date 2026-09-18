import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { pageMeta, jsonLd, siteUrl } from "@/lib/seo";
import { auth } from "@/lib/auth";
import { userCanAccessFull } from "@/lib/access";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/primitives";
import { PlayButton } from "@/components/music/PlayButton";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const song = await prisma.song.findUnique({ where: { slug }, include: { artist: true } });
  if (!song) return pageMeta({ title: "Song", description: "AA Maka Production music" });
  return pageMeta({
    title: song.seoTitle || `${song.title} — ${song.artist.name}`,
    description: song.seoDescription || song.shortDescription || `Listen to ${song.title} from AA Maka Production.`,
    path: `/music/song/${song.slug}`,
    image: song.coverUrl,
  });
}

export default async function SongPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const song = await prisma.song.findUnique({
    where: { slug },
    include: { artist: true, genre: true, album: true },
  });
  if (!song || !song.published) notFound();
  const access = await userCanAccessFull({
    userId: session?.user?.id,
    accessType: song.accessType,
    exclusive: song.exclusive,
    earlyAccess: song.earlyAccess,
    published: song.published,
    scheduledAt: song.scheduledAt,
    albumId: song.albumId,
    songId: song.id,
  });

  return (
    <div className="bg-ink text-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "MusicRecording",
          name: song.title,
          byArtist: song.artist.name,
          datePublished: song.releaseDate,
          inAlbum: song.album?.title,
          url: siteUrl(`/music/song/${song.slug}`),
        })}
      />
      <div className="mx-auto grid max-w-page gap-8 px-4 pb-16 pt-8 md:grid-cols-[320px_1fr] md:gap-10 md:px-6 md:py-16">
        <div
          className="aspect-[4/3] rounded-3xl bg-cover bg-center shadow-gold md:aspect-square"
          style={{ backgroundImage: song.coverUrl ? `url(${song.coverUrl})` : undefined }}
        />
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-gold">{song.genre?.name || "Sindhi music"}</p>
          <h1 className="mt-3 font-display text-5xl md:text-7xl">{song.title}</h1>
          {song.titleSd ? <p className="mt-2 font-sindhi text-2xl text-cream/80">{song.titleSd}</p> : null}
          <p className="mt-4 text-lg text-cream/70">
            <a href={`/music/artist/${song.artist.slug}`}>{song.artist.name}</a>
          </p>
          <p className="mt-6 max-w-xl text-cream/75">{song.shortDescription}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PlayButton
              song={{
                id: song.id,
                title: song.title,
                artist: song.artist.name,
                coverUrl: song.coverUrl,
                accessType: song.accessType,
                exclusive: song.exclusive,
                albumId: song.albumId,
              }}
            />
            {!access.ok ? (
              <>
                <Button href="/membership" variant="gold">
                  Unlock full song
                </Button>
                {song.album ? (
                  <Button href={`/music/album/${song.album.slug}`} variant="secondary" className="!text-cream">
                    Buy album
                  </Button>
                ) : null}
              </>
            ) : (
              <p className="self-center text-sm text-gold">Full access unlocked</p>
            )}
          </div>
          <dl className="mt-10 grid gap-3 text-sm text-cream/70 md:grid-cols-2">
            {song.singer ? <div><dt className="text-gold">Singer</dt><dd>{song.singer}</dd></div> : null}
            {song.composer ? <div><dt className="text-gold">Composer</dt><dd>{song.composer}</dd></div> : null}
            {song.producer ? <div><dt className="text-gold">Producer</dt><dd>{song.producer}</dd></div> : null}
            {song.releaseDate ? <div><dt className="text-gold">Released</dt><dd>{formatDate(song.releaseDate)}</dd></div> : null}
            {song.copyrightOwner ? <div><dt className="text-gold">Copyright</dt><dd>{song.copyrightOwner}</dd></div> : null}
          </dl>
          <div className="mt-6 flex gap-4 text-sm">
            {song.youtubeUrl ? <a href={song.youtubeUrl}>YouTube</a> : null}
            {song.facebookUrl ? <a href={song.facebookUrl}>Facebook</a> : null}
            {song.tiktokUrl ? <a href={song.tiktokUrl}>TikTok</a> : null}
          </div>
        </div>
      </div>
      {song.lyrics ? (
        <div className="mx-auto max-w-page px-4 pb-20 md:px-6">
          <h2 className="font-display text-3xl">Lyrics</h2>
          <pre className="mt-4 whitespace-pre-wrap font-sindhi text-lg text-cream/80">{song.lyrics}</pre>
        </div>
      ) : null}
    </div>
  );
}
