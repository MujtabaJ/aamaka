import { NextResponse } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { absolutePrivatePath, verifyMediaToken } from "@/lib/media";
import { userCanAccessFull } from "@/lib/access";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const token = searchParams.get("token") ?? "";
  if (!id) return NextResponse.json({ error: "Missing media" }, { status: 400 });

  const session = await auth();
  if (!verifyMediaToken(token, id, session?.user?.id)) {
    return NextResponse.json({ error: "Invalid or expired media token" }, { status: 403 });
  }

  const media = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (media.visibility === "private") {
    const song = await prisma.song.findFirst({
      where: {
        OR: [{ previewMediaId: id }, { fullAudioMediaId: id }, { fullVideoMediaId: id }],
      },
    });
    if (song && (media.id === song.fullAudioMediaId || media.id === song.fullVideoMediaId)) {
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
      if (!access.ok) {
        return NextResponse.json({ error: "Not authorised for full media" }, { status: 403 });
      }
    }
  }

  try {
    const filePath = absolutePrivatePath(media.storageKey);
    const info = await stat(filePath);
    const nodeStream = createReadStream(filePath);
    const stream = Readable.toWeb(nodeStream) as ReadableStream;
    return new Response(stream, {
      headers: {
        "Content-Type": media.mimeType,
        "Content-Length": String(info.size),
        "Cache-Control": "private, max-age=60",
        "Accept-Ranges": "bytes",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return NextResponse.json({ error: "Media file missing" }, { status: 404 });
  }
}
