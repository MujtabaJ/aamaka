"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type Playable = {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string | null;
  accessType: string;
  exclusive?: boolean;
  albumId?: string | null;
};

type PlayerState = {
  current: Playable | null;
  queue: Playable[];
  playing: boolean;
  expanded: boolean;
  locked: boolean;
  src: string | null;
  kind: "preview" | "full";
  play: (song: Playable, queue?: Playable[]) => Promise<void>;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  setExpanded: (v: boolean) => void;
};

const Ctx = createContext<PlayerState | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<Playable | null>(null);
  const [queue, setQueue] = useState<Playable[]>([]);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [locked, setLocked] = useState(false);
  const [src, setSrc] = useState<string | null>(null);
  const [kind, setKind] = useState<"preview" | "full">("preview");

  const load = useCallback(async (song: Playable) => {
    const res = await fetch(`/api/media/play?songId=${song.id}`);
    const data = await res.json();
    setCurrent(song);
    setLocked(!data.full);
    setKind(data.full ? "full" : "preview");
    setSrc(data.url ?? null);
    setPlaying(Boolean(data.url));
  }, []);

  const play = useCallback(
    async (song: Playable, nextQueue?: Playable[]) => {
      if (nextQueue) setQueue(nextQueue);
      await load(song);
    },
    [load],
  );

  const toggle = useCallback(() => setPlaying((v) => !v), []);

  const next = useCallback(() => {
    if (!current || queue.length === 0) return;
    const i = queue.findIndex((s) => s.id === current.id);
    const item = queue[(i + 1) % queue.length];
    if (item) void load(item);
  }, [current, queue, load]);

  const prev = useCallback(() => {
    if (!current || queue.length === 0) return;
    const i = queue.findIndex((s) => s.id === current.id);
    const item = queue[(i - 1 + queue.length) % queue.length];
    if (item) void load(item);
  }, [current, queue, load]);

  const value = useMemo(
    () => ({
      current,
      queue,
      playing,
      expanded,
      locked,
      src,
      kind,
      play,
      toggle,
      next,
      prev,
      setExpanded,
    }),
    [current, queue, playing, expanded, locked, src, kind, play, toggle, next, prev],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("PlayerProvider missing");
  return ctx;
}
