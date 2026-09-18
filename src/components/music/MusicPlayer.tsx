"use client";

import { Pause, Play, SkipBack, SkipForward, Maximize2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/components/music/PlayerProvider";
import { Button } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function MusicPlayer() {
  const { current, playing, toggle, next, prev, src, locked, kind, expanded, setExpanded } =
    usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) void el.play().catch(() => undefined);
    else el.pause();
  }, [playing, src]);

  if (!current) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={src ?? undefined}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onEnded={next}
      />
      <div className="fixed inset-x-0 bottom-14 z-50 md:bottom-0">
        <div className="mx-auto max-w-page px-3 pb-2">
          <div className="flex items-center gap-3 rounded-2xl border border-cream/10 bg-ink/95 p-3 text-cream shadow-soft backdrop-blur">
            <div
              className="h-12 w-12 shrink-0 rounded-lg bg-ajrak/40 bg-cover bg-center"
              style={{ backgroundImage: current.coverUrl ? `url(${current.coverUrl})` : undefined }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{current.title}</p>
              <p className="truncate text-xs text-cream/60">
                {current.artist} · {kind === "preview" ? "Preview" : "Full track"}
              </p>
              <input
                type="range"
                min={0}
                max={duration || 1}
                value={progress}
                className="player-progress mt-1 h-1 w-full appearance-none rounded-full bg-cream/20"
                onChange={(e) => {
                  const time = Number(e.target.value);
                  if (audioRef.current) audioRef.current.currentTime = time;
                  setProgress(time);
                }}
              />
            </div>
            <div className="flex items-center gap-1">
              <button onClick={prev} className="p-2" aria-label="Previous">
                <SkipBack className="h-4 w-4" />
              </button>
              <button onClick={toggle} className="rounded-full bg-gold p-2 text-ink" aria-label="Play">
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button onClick={next} className="p-2" aria-label="Next">
                <SkipForward className="h-4 w-4" />
              </button>
              <button onClick={() => setExpanded(true)} className="hidden p-2 sm:block">
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          {locked ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ajrak px-3 py-2 text-xs text-cream">
              <span>Listen to the preview — unlock the full song with membership.</span>
              <Button href="/membership" variant="gold" className="!py-1 !text-xs">
                Become a Member
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      {expanded ? (
        <div className="fixed inset-0 z-[60] cinema-scrim bg-ink text-cream">
          <button className="absolute right-4 top-4" onClick={() => setExpanded(false)}>
            <X />
          </button>
          <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
            <div
              className={cn("h-64 w-64 rounded-3xl bg-cover bg-center shadow-gold md:h-80 md:w-80")}
              style={{ backgroundImage: current.coverUrl ? `url(${current.coverUrl})` : undefined }}
            />
            <div>
              <p className="font-display text-4xl">{current.title}</p>
              <p className="mt-2 text-cream/70">{current.artist}</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={prev}>
                <SkipBack />
              </button>
              <button onClick={toggle} className="rounded-full bg-gold p-4 text-ink">
                {playing ? <Pause /> : <Play />}
              </button>
              <button onClick={next}>
                <SkipForward />
              </button>
            </div>
            {locked ? (
              <Button href="/membership" variant="gold">
                Unlock full song
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
