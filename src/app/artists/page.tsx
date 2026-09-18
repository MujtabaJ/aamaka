import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { ArtistCard } from "@/components/music/ArtistCard";
import { photos } from "@/lib/photos";

export const metadata = pageMeta({
  title: "Sindhi Artists",
  description: "Artists and singers recorded and presented by AA Maka Production.",
  path: "/artists",
});

export default async function ArtistsPage() {
  const artists = await prisma.artist.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });
  return (
    <div className="mx-auto max-w-page px-4 py-16 md:px-6">
      <div
        className="mb-10 h-48 overflow-hidden rounded-3xl bg-cover bg-center"
        style={{ backgroundImage: `url(${photos.mic})` }}
      />
      <p className="text-xs uppercase tracking-[0.28em] text-ajrak">Voices</p>
      <h1 className="mt-3 font-display text-5xl">Artists</h1>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </div>
  );
}
