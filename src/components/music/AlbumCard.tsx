import Link from "next/link";
import { formatMoney, effectivePrice, salePercent } from "@/lib/money";
import { Badge, Button } from "@/components/ui/primitives";
import { freshSrc } from "@/lib/image-specs";

export function AlbumCard({
  album,
}: {
  album: {
    slug: string;
    title: string;
    coverUrl?: string | null;
    updatedAt?: Date | string | null;
    pricePaisa: number;
    salePricePaisa?: number | null;
    artist?: { name: string } | null;
    tracks?: { id: string }[];
  };
}) {
  const price = effectivePrice(album.pricePaisa, album.salePricePaisa);
  const off = salePercent(album.pricePaisa, album.salePricePaisa);
  return (
    <article className="overflow-hidden rounded-3xl bg-ink text-cream shadow-soft">
      <div
        className="aspect-square bg-cover bg-center"
        style={{ backgroundImage: album.coverUrl ? `url(${freshSrc(album.coverUrl, album.updatedAt)})` : undefined }}
      />
      <div className="space-y-2 p-5">
        <Link href={`/music/album/${album.slug}`} className="font-display text-2xl">
          {album.title}
        </Link>
        <p className="text-sm text-cream/60">{album.artist?.name}</p>
        <p className="text-xs uppercase tracking-[0.16em] text-gold">
          {album.tracks?.length ?? 0} tracks
        </p>
        <div className="flex items-center gap-2">
          <span className="text-lg">{formatMoney(price)}</span>
          {off ? <Badge tone="gold">{off}% off</Badge> : null}
        </div>
        <div className="flex gap-2 pt-2">
          <Button href={`/music/album/${album.slug}`} variant="gold" className="flex-1">
            Preview
          </Button>
          <form action={`/api/cart/add`} method="post" className="flex-1">
            <input type="hidden" name="kind" value="album" />
            <input type="hidden" name="albumId" value={album.slug} />
            <Button type="submit" variant="secondary" className="w-full !border-cream/20 !bg-transparent !text-cream">
              Buy
            </Button>
          </form>
        </div>
      </div>
    </article>
  );
}
