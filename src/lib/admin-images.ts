import { savePublicFile, validateUpload } from "@/lib/media";

export function withCacheBust(url: string) {
  const clean = url.replace(/([?&])v=\d+/g, "").replace(/[?&]$/, "");
  if (clean.startsWith("data:") || clean.startsWith("blob:")) return clean;
  return `${clean}${clean.includes("?") ? "&" : "?"}v=${Date.now()}`;
}

export async function imageFromForm(
  form: FormData,
  fileField: string,
  urlField: string,
  current?: string | null,
) {
  const value = form.get(fileField);
  if (value && typeof value !== "string" && value.size) {
    validateUpload("image", value.type, value.size);
    return withCacheBust(
      await savePublicFile("covers", value.name, Buffer.from(await value.arrayBuffer())),
    );
  }
  const pasted = String(form.get(urlField) || "").trim();
  if (pasted) return withCacheBust(pasted);
  return current ? withCacheBust(current) : null;
}
