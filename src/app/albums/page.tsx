import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { AlbumCard } from "@/components/music/AlbumCard";
import { getHomepageSection } from "@/lib/homepage";
import { PageHero } from "@/components/content/PageHero";

export const metadata = pageMeta({
  title: "Sindhi Music Albums",
  description: "Buy Sindhi Sufi and folk albums from AA Maka Production.",
  path: "/albums",
});

export default async function AlbumsPage() {
  const [albums, section] = await Promise.all([
    prisma.album.findMany({
      where: { published: true },
      include: { artist: true, tracks: true },
      orderBy: { releaseDate: "desc" },
    }),
    getHomepageSection("albums"),
  ]);
  return (
    <div className="mx-auto max-w-page px-4 py-16 md:px-6">
      <PageHero section={section} fallbackTitle="Albums" />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
}
