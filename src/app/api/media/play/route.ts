import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { userCanAccessFull } from "@/lib/access";
import { signMediaToken } from "@/lib/media";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const songId = searchParams.get("songId");
  if (!songId) return NextResponse.json({ error: "Missing song" }, { status: 400 });

  const session = await auth();
  const song = await prisma.song.findUnique({
    where: { id: songId },
    include: { previewMedia: true, fullAudioMedia: true },
  });
  if (!song || !song.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const access = await userCanAccessFull({
    userId: session?.user?.id,
    accessType: song.accessType,
    exclusive: song.exclusive,
    earlyAccess: song.earlyAccess,
    published: song.published,
    scheduledAt: song.scheduledAt,
    albumId: song.albumId,
    songId: song.id,
  });

  const media = access.ok ? song.fullAudioMedia : song.previewMedia;
  if (!media) {
    return NextResponse.json({ url: null, full: access.ok, reason: access.reason });
  }

  await prisma.playEvent.create({
    data: {
      songId: song.id,
      userId: session?.user?.id,
      kind: access.ok ? "full" : "preview",
    },
  });
  await prisma.song.update({
    where: { id: song.id },
    data: { playCount: { increment: 1 } },
  });

  const token = signMediaToken(media.id, session?.user?.id ?? "anon");
  const url = `/api/media/stream?id=${media.id}&token=${token}`;
  return NextResponse.json({ url, full: access.ok, reason: access.reason });
}
