import { savePublicFile, validateUpload } from "@/lib/media";

const MIME_FROM_NAME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export function withCacheBust(url: string) {
  const clean = url.replace(/([?&])v=\d+/g, "").replace(/[?&]$/, "");
  if (clean.startsWith("data:") || clean.startsWith("blob:")) return clean;
  return `${clean}${clean.includes("?") ? "&" : "?"}v=${Date.now()}`;
}

async function storeUpload(file: File) {
  const mime =
    file.type ||
    MIME_FROM_NAME[file.name.slice(file.name.lastIndexOf(".")).toLowerCase()] ||
    "image/jpeg";
  validateUpload("image", mime, file.size);
  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    return withCacheBust(await savePublicFile("covers", file.name, buffer));
  } catch {
    if (buffer.length <= 1_400_000) {
      return `data:${mime};base64,${buffer.toString("base64")}`;
    }
    throw new Error("Could not store that picture. Try a JPG or PNG under 1.5 MB.");
  }
}

export async function imageFromForm(
  form: FormData,
  fileField: string,
  urlField: string,
  current?: string | null,
) {
  const value = form.get(fileField);
  if (value && typeof value !== "string" && value.size) {
    return await storeUpload(value);
  }
  const pasted = String(form.get(urlField) || "").trim();
  if (pasted) return withCacheBust(pasted);
  return current ? withCacheBust(current) : null;
}
