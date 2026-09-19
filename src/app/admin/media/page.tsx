import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { savePrivateFile, savePublicFile, validateUpload, ensureStorage } from "@/lib/media";
import { Field, inputClass, Button } from "@/components/ui/primitives";
import { revalidatePath } from "next/cache";

export default async function AdminMediaPage() {
  await requirePermission("media.manage");
  const media = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 80 });

  async function upload(form: FormData) {
    "use server";
    const staff = await requirePermission("media.manage");
    await ensureStorage();
    const file = form.get("file");
    if (!file || typeof file === "string" || !file.size) return;
    const buffer = Buffer.from(await file.arrayBuffer());
    const kind = String(form.get("kind") || "image") as "image" | "audio" | "video";
    const visibility = String(form.get("visibility") || "public");
    validateUpload(kind, file.type, file.size);
    const storageKey =
      visibility === "public" && kind === "image"
        ? await savePublicFile("covers", file.name, buffer)
        : await savePrivateFile(file.name, buffer);
    await prisma.mediaAsset.create({
      data: {
        kind,
        visibility,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        storageKey: storageKey.replace(/^\/media\//, ""),
        uploadedById: staff.id,
      },
    });
    revalidatePath("/admin/media");
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Media library</h1>
      <p className="mt-2 text-sm text-ink/60">
        Private full tracks stay outside the public folder and are served through signed URLs.
      </p>
      <form action={upload} className="mt-6 grid gap-3 rounded-3xl bg-white p-5 md:grid-cols-2">
        <Field label="File">
          <input name="file" type="file" required accept="image/*,audio/*,video/*" />
        </Field>
        <Field label="Kind">
          <select name="kind" className={inputClass}>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
          </select>
        </Field>
        <Field label="Visibility">
          <select name="visibility" className={inputClass}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </Field>
        <Button type="submit">Upload</Button>
      </form>
      <ul className="mt-6 space-y-2 text-sm">
        {media.length === 0 ? <p className="text-ink/60">No media uploaded yet.</p> : null}
        {media.map((m) => (
          <li key={m.id} className="rounded-2xl bg-white p-4">
            {m.filename} · {m.kind} · {m.visibility} · {(m.sizeBytes / 1024).toFixed(0)} KB
          </li>
        ))}
      </ul>
    </div>
  );
}
