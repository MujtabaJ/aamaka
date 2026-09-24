import { savePublicFile } from "@/lib/media";
import { IMAGE_SPECS, type ImageSpecKey } from "@/lib/image-specs";

export function withCacheBust(url: string) {
  const clean = url.replace(/([?&])v=\d+/g, "").replace(/[?&]$/, "");
  if (clean.startsWith("data:") || clean.startsWith("blob:")) return clean;
  return `${clean}${clean.includes("?") ? "&" : "?"}v=${Date.now()}`;
}

async function resizeToJpeg(buffer: Buffer, maxWidth: number, maxHeight: number) {
  try {
    const sharp = (await import("sharp")).default;
    let quality = 82;
    let width = maxWidth;
    let height = maxHeight;
    let output = await sharp(buffer)
      .rotate()
      .resize({ width, height, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    while (output.length > 1_200_000 && quality > 45) {
      quality -= 10;
      width = Math.round(width * 0.85);
      height = Math.round(height * 0.85);
      output = await sharp(buffer)
        .rotate()
        .resize({ width, height, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
    }
    return output;
  } catch {
    return buffer;
  }
}

async function uploadDurable(buffer: Buffer, filename: string) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.[^.]+$/, ".jpg");
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID || process.env.VERCEL) {
    try {
      const { put } = await import("@vercel/blob");
      const stored = await put(`media/covers/${Date.now()}-${safe}`, buffer, {
        access: "public",
        contentType: "image/jpeg",
        addRandomSuffix: true,
      });
      return stored.url;
    } catch {
      /* fall through to a local or inline copy */
    }
  }
  try {
    return await savePublicFile("covers", safe, buffer);
  } catch {
    if (buffer.length <= 1_400_000) {
      return `data:image/jpeg;base64,${buffer.toString("base64")}`;
    }
    return `data:image/jpeg;base64,${buffer.subarray(0, 1_400_000).toString("base64")}`;
  }
}

async function storeUpload(file: File, spec: ImageSpecKey) {
  const guide = IMAGE_SPECS[spec] ?? IMAGE_SPECS.section;
  const raw = Buffer.from(await file.arrayBuffer());
  const resized = await resizeToJpeg(raw, guide.width, guide.height);
  const stored = await uploadDurable(resized, file.name || "picture.jpg");
  return stored.startsWith("data:") ? stored : withCacheBust(stored);
}

export async function imageFromForm(
  form: FormData,
  fileField: string,
  urlField: string,
  current?: string | null,
  spec: ImageSpecKey = "section",
) {
  try {
    const value = form.get(fileField);
    if (value && typeof value !== "string" && value.size) {
      return await storeUpload(value, spec);
    }
    const pasted = String(form.get(urlField) || "").trim();
    if (pasted) return pasted.startsWith("data:") ? pasted : withCacheBust(pasted);
    return current ? (current.startsWith("data:") ? current : withCacheBust(current)) : null;
  } catch {
    return current ?? null;
  }
}
