import { savePublicFile, validateUpload } from "@/lib/media";

export async function imageFromForm(
  form: FormData,
  fileField: string,
  urlField: string,
  current?: string | null,
) {
  const value = form.get(fileField);
  if (value && typeof value !== "string" && value.size) {
    validateUpload("image", value.type, value.size);
    return savePublicFile("covers", value.name, Buffer.from(await value.arrayBuffer()));
  }
  return String(form.get(urlField) || "").trim() || current || null;
}
