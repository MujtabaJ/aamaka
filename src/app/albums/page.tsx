import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { AlbumCard } from "@/components/music/AlbumCard";
import { photos } from "@/lib/photos";

export const metadata = pageMeta({
  title: "Sindhi Music Albums",
  description: "Buy Sindhi Sufi and folk albums from AA Maka Production.",
  path: "/albums",
});

export default async function AlbumsPage() {
  const albums = await prisma.album.findMany({
    where: { published: true },
    include: { artist: true, tracks: true },
    orderBy: { releaseDate: "desc" },
  });
  return (
    <div className="mx-auto max-w-page px-4 py-16 md:px-6">
      <div
        className="mb-10 h-48 overflow-hidden rounded-3xl bg-cover bg-center"
        style={{ backgroundImage: `url(${photos.studio})` }}
      />
      <p className="text-xs uppercase tracking-[0.28em] text-ajrak">Digital store</p>
      <h1 className="mt-3 font-display text-5xl">Albums</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
}
