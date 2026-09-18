"use client";

import { Play } from "lucide-react";
import { usePlayer, type Playable } from "@/components/music/PlayerProvider";

export function PlayButton({ song }: { song: Playable }) {
  const { play } = usePlayer();
  return (
    <button
      onClick={() => play(song, [song])}
      className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-ink"
    >
      <Play className="h-4 w-4" /> Listen now
    </button>
  );
}
