import { createHmac, timingSafeEqual } from "crypto";
import fs from "fs/promises";
import path from "path";

const TTL = Number(process.env.MEDIA_URL_TTL ?? 300);

function secret() {
  return process.env.MEDIA_SIGNING_SECRET || process.env.AUTH_SECRET || "dev-media-secret";
}

export function storageRoot() {
  return path.resolve(process.cwd(), process.env.STORAGE_LOCAL_DIR ?? "./storage");
}

export function privateDir() {
  return path.join(storageRoot(), "private");
}

export function publicMediaDir() {
  if (process.env.VERCEL) return "/tmp/aamaka-media";
  return path.join(process.cwd(), "public", "media");
}

export function signMediaToken(mediaId: string, userId = "anon") {
  const exp = Math.floor(Date.now() / 1000) + TTL;
  const payload = `${mediaId}.${userId}.${exp}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyMediaToken(token: string, mediaId: string, userId?: string | null) {
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [id, uid, expStr, sig] = parts;
  if (id !== mediaId) return false;
  if (userId && uid !== "anon" && uid !== userId) return false;
  const exp = Number(expStr);
  if (!exp || exp < Math.floor(Date.now() / 1000)) return false;
  const payload = `${id}.${uid}.${expStr}`;
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function ensureStorage() {
  await fs.mkdir(privateDir(), { recursive: true });
  await fs.mkdir(path.join(publicMediaDir(), "covers"), { recursive: true });
  await fs.mkdir(path.join(publicMediaDir(), "products"), { recursive: true });
  await fs.mkdir(path.join(publicMediaDir(), "previews"), { recursive: true });
}

export async function savePrivateFile(filename: string, buffer: Buffer) {
  await ensureStorage();
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${Date.now()}-${safe}`;
  const full = path.join(privateDir(), key);
  await fs.writeFile(full, buffer);
  return key;
}

export async function savePublicFile(folder: string, filename: string, buffer: Buffer) {
  await ensureStorage();
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${folder}/${Date.now()}-${safe}`;
  const full = path.join(publicMediaDir(), key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, buffer);
  return `/media/${key}`;
}

export function absolutePrivatePath(storageKey: string) {
  return path.join(privateDir(), storageKey);
}

const ALLOWED_MIME: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
  audio: ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/ogg", "audio/webm"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
};

export function validateUpload(kind: "image" | "audio" | "video", mime: string, size: number) {
  const allowed = ALLOWED_MIME[kind];
  if (!allowed.includes(mime)) {
    throw new Error(`Unsupported ${kind} type: ${mime}`);
  }
  const max =
    kind === "image" ? 8 * 1024 * 1024 : kind === "audio" ? 80 * 1024 * 1024 : 400 * 1024 * 1024;
  if (size > max) {
    throw new Error(`File is too large for ${kind} uploads`);
  }
}
