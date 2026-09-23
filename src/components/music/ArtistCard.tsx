import Link from "next/link";
import { freshSrc } from "@/lib/image-specs";

export function ArtistCard({
  artist,
}: {
  artist: { slug: string; name: string; photoUrl?: string | null; biography?: string | null; updatedAt?: Date | string | null };
}) {
  const photo = freshSrc(artist.photoUrl, artist.updatedAt);
  return (
    <Link href={`/music/artist/${artist.slug}`} className="group block">
      <div
        className="aspect-[4/5] overflow-hidden rounded-3xl bg-ink/20 bg-cover bg-center"
        style={{ backgroundImage: photo ? `url(${photo})` : undefined }}
      />
      <p className="mt-3 font-display text-2xl group-hover:text-ajrak">{artist.name}</p>
      {artist.biography ? (
        <p className="mt-1 line-clamp-2 text-sm text-ink/60">{artist.biography}</p>
      ) : null}
    </Link>
  );
}
