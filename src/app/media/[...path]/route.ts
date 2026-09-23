import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { publicMediaDir } from "@/lib/media";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const segments = (await params).path;
  if (!segments.length || segments.some((part) => !part || part.includes("..") || part.includes("/") || part.includes("\\"))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const root = publicMediaDir();
  const file = path.join(root, ...segments);
  if (!file.startsWith(root)) {
    return new NextResponse("Not found", { status: 404 });
  }
  try {
    const data = await fs.readFile(file);
    return new NextResponse(data, {
      headers: {
        "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
