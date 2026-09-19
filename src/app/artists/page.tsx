import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { ArtistCard } from "@/components/music/ArtistCard";
import { getHomepageSection } from "@/lib/homepage";
import { PageHero } from "@/components/content/PageHero";

export const metadata = pageMeta({
  title: "Sindhi Artists",
  description: "Artists and singers recorded and presented by AA Maka Production.",
  path: "/artists",
});

export default async function ArtistsPage() {
  const [artists, section] = await Promise.all([
    prisma.artist.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    }),
    getHomepageSection("artists"),
  ]);
  return (
    <div className="mx-auto max-w-page px-4 py-16 md:px-6">
      <PageHero section={section} fallbackTitle="Artists" />
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </div>
  );
}
