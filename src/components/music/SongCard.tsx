"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { usePlayer, type Playable } from "@/components/music/PlayerProvider";
import { accessBadge } from "@/lib/access-ui";

export type SongCardData = Playable & {
  slug: string;
  genre?: string | null;
  shortDescription?: string | null;
};

export function SongCard({ song, queue }: { song: SongCardData; queue?: Playable[] }) {
  const { play } = usePlayer();
  const badge = accessBadge(song.accessType, song.exclusive);
  return (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-soft">
      <div className="relative aspect-square overflow-hidden">
        <div
          className="h-full w-full bg-ink/20 bg-cover bg-center transition duration-500 group-hover:scale-105"
          style={{ backgroundImage: song.coverUrl ? `url(${song.coverUrl})` : undefined }}
        />
        <button
          onClick={() => play(song, queue)}
          className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition group-hover:bg-ink/25 group-hover:opacity-100"
          aria-label={`Play ${song.title}`}
        >
          <span className="rounded-full bg-gold p-3 text-ink">
            <Play className="h-5 w-5" />
          </span>
        </button>
        {badge ? (
          <div className="absolute left-3 top-3">
            <Badge tone={badge.tone}>{badge.label}</Badge>
          </div>
        ) : null}
      </div>
      <div className="space-y-1 p-4">
        <Link href={`/music/song/${song.slug}`} className="font-display text-xl hover:text-ajrak">
          {song.title}
        </Link>
        <p className="text-sm text-ink/60">{song.artist}</p>
        {song.genre ? <p className="text-xs uppercase tracking-[0.16em] text-gold-600">{song.genre}</p> : null}
        {song.shortDescription ? (
          <p className="line-clamp-2 text-sm text-ink/70">{song.shortDescription}</p>
        ) : null}
      </div>
    </article>
  );
}
