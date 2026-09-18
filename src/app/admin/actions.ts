"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { audit } from "@/lib/audit";
import { toSlug } from "@/lib/utils";
import { rupeesToPaisa } from "@/lib/money";
import { savePrivateFile, savePublicFile, validateUpload, ensureStorage } from "@/lib/media";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notify } from "@/lib/notifications";
import { fulfillOrder } from "@/lib/orders";

async function fileFromForm(form: FormData, key: string) {
  const value = form.get(key);
  if (!value || typeof value === "string") return null;
  const file = value as File;
  if (!file.size) return null;
  const buffer = Buffer.from(await file.arrayBuffer());
  return { file, buffer };
}

export async function saveSong(form: FormData) {
  const user = await requirePermission("music.manage");
  await ensureStorage();
  const id = String(form.get("id") || "");
  const title = String(form.get("title") || "");
  const slug = toSlug(String(form.get("slug") || title));
  const cover = await fileFromForm(form, "cover");
  const preview = await fileFromForm(form, "preview");
  const audio = await fileFromForm(form, "audio");
  const video = await fileFromForm(form, "video");

  let coverUrl: string | undefined;
  let previewMediaId: string | undefined;
  let fullAudioMediaId: string | undefined;
  let fullVideoMediaId: string | undefined;

  if (cover) {
    validateUpload("image", cover.file.type, cover.file.size);
    coverUrl = await savePublicFile("covers", cover.file.name, cover.buffer);
  }
  if (preview) {
    validateUpload("audio", preview.file.type, preview.file.size);
    const key = await savePrivateFile(preview.file.name, preview.buffer);
    const media = await prisma.mediaAsset.create({
      data: {
        kind: "audio",
        visibility: "public",
        filename: preview.file.name,
        mimeType: preview.file.type,
        sizeBytes: preview.file.size,
        storageKey: key,
        uploadedById: user.id,
      },
    });
    previewMediaId = media.id;
  }
  if (audio) {
    validateUpload("audio", audio.file.type, audio.file.size);
    const key = await savePrivateFile(audio.file.name, audio.buffer);
    const media = await prisma.mediaAsset.create({
      data: {
        kind: "audio",
        visibility: "private",
        filename: audio.file.name,
        mimeType: audio.file.type,
        sizeBytes: audio.file.size,
        storageKey: key,
        uploadedById: user.id,
      },
    });
    fullAudioMediaId = media.id;
  }
  if (video) {
    validateUpload("video", video.file.type, video.file.size);
    const key = await savePrivateFile(video.file.name, video.buffer);
    const media = await prisma.mediaAsset.create({
      data: {
        kind: "video",
        visibility: "private",
        filename: video.file.name,
        mimeType: video.file.type,
        sizeBytes: video.file.size,
        storageKey: key,
        uploadedById: user.id,
      },
    });
    fullVideoMediaId = media.id;
  }

  const data = {
    title,
    slug,
    titleSd: String(form.get("titleSd") || "") || null,
    titleEn: String(form.get("titleEn") || "") || null,
    artistId: String(form.get("artistId")),
    genreId: String(form.get("genreId") || "") || null,
    albumId: String(form.get("albumId") || "") || null,
    singer: String(form.get("singer") || "") || null,
    composer: String(form.get("composer") || "") || null,
    producer: String(form.get("producer") || "") || null,
    language: String(form.get("language") || "Sindhi"),
    shortDescription: String(form.get("shortDescription") || "") || null,
    lyrics: String(form.get("lyrics") || "") || null,
    credits: String(form.get("credits") || "") || null,
    copyrightOwner: String(form.get("copyrightOwner") || "") || null,
    licenseInfo: String(form.get("licenseInfo") || "") || null,
    youtubeUrl: String(form.get("youtubeUrl") || "") || null,
    accessType: String(form.get("accessType") || "preview"),
    exclusive: form.get("exclusive") === "on",
    earlyAccess: form.get("earlyAccess") === "on",
    featured: form.get("featured") === "on",
    published: form.get("published") === "on",
    seoTitle: String(form.get("seoTitle") || "") || null,
    seoDescription: String(form.get("seoDescription") || "") || null,
    ...(coverUrl ? { coverUrl } : {}),
    ...(previewMediaId ? { previewMediaId } : {}),
    ...(fullAudioMediaId ? { fullAudioMediaId } : {}),
    ...(fullVideoMediaId ? { fullVideoMediaId } : {}),
  };

  const song = id
    ? await prisma.song.update({ where: { id }, data })
    : await prisma.song.create({ data });

  await audit({ userId: user.id, action: id ? "update" : "create", entity: "song", entityId: song.id });
  revalidatePath("/admin/music");
  redirect("/admin/music");
}

export async function saveProduct(form: FormData) {
  const user = await requirePermission("products.manage");
  const id = String(form.get("id") || "");
  const name = String(form.get("name"));
  const images = [] as string[];
  for (const [key, value] of form.entries()) {
    if (key === "images" && value instanceof File && value.size) {
      validateUpload("image", value.type, value.size);
      images.push(await savePublicFile("products", value.name, Buffer.from(await value.arrayBuffer())));
    }
  }
  const data = {
    name,
    slug: toSlug(String(form.get("slug") || name)),
    nameSd: String(form.get("nameSd") || "") || null,
    sku: String(form.get("sku")),
    categoryId: String(form.get("categoryId")),
    description: String(form.get("description")),
    shortDescription: String(form.get("shortDescription") || "") || null,
    pricePaisa: rupeesToPaisa(Number(form.get("price") || 0)),
    salePricePaisa: form.get("salePrice") ? rupeesToPaisa(Number(form.get("salePrice"))) : null,
    stock: Number(form.get("stock") || 0),
    lowStockAt: Number(form.get("lowStockAt") || 5),
    shippingInfo: String(form.get("shippingInfo") || "") || null,
    status: String(form.get("status") || "draft"),
    featured: form.get("featured") === "on",
    ...(images.length ? { images: JSON.stringify(images) } : {}),
  };
  const product = id
    ? await prisma.product.update({ where: { id }, data })
    : await prisma.product.create({ data });
  await audit({ userId: user.id, action: id ? "update" : "create", entity: "product", entityId: product.id });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateOrderStatus(form: FormData) {
  const user = await requirePermission("orders.manage");
  const id = String(form.get("id"));
  const status = String(form.get("status"));
  const trackingNumber = String(form.get("trackingNumber") || "") || null;
  const courierName = String(form.get("courierName") || "") || null;
  const order = await prisma.order.update({
    where: { id },
    data: { status, trackingNumber, courierName },
  });
  if (status === "paid" && order.paymentStatus !== "paid") {
    await prisma.order.update({ where: { id }, data: { paymentStatus: "paid" } });
    await fulfillOrder(id);
  }
  await audit({ userId: user.id, action: "status", entity: "order", entityId: id, metadata: { status } });
  await notify({
    userId: order.userId,
    type: "order_status",
    title: `Order ${order.number} is ${status.replace("_", " ")}`,
    body: trackingNumber ? `Tracking: ${courierName} ${trackingNumber}` : `Your order is now ${status}.`,
    href: `/account/orders/${order.id}`,
    orderId: order.id,
  });
  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${id}`);
}
