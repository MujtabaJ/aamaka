"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { audit } from "@/lib/audit";
import { parseJson, toSlug } from "@/lib/utils";
import { rupeesToPaisa } from "@/lib/money";
import { savePrivateFile, validateUpload } from "@/lib/media";
import { imageFromForm, withCacheBust } from "@/lib/admin-images";
import { persistEntity, rememberEntity } from "@/lib/cms-overlay";
import { runAdminSave } from "@/lib/admin-save";
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
  const id = String(form.get("id") || "");
  await runAdminSave("/admin/music", async () => {
  const user = await requirePermission("music.manage");
  const existing = id ? await prisma.song.findUnique({ where: { id } }) : null;
  const title = String(form.get("title") || "");
  const slug = existing?.slug || toSlug(String(form.get("slug") || title));
  const cover = await fileFromForm(form, "cover");
  const preview = await fileFromForm(form, "preview");
  const audio = await fileFromForm(form, "audio");
  const video = await fileFromForm(form, "video");

  let coverUrl: string | undefined;
  let previewMediaId: string | undefined;
  let fullAudioMediaId: string | undefined;
  let fullVideoMediaId: string | undefined;

  if (cover) {
    const extra = new FormData();
    extra.set("coverFile", cover.file);
    coverUrl = (await imageFromForm(extra, "coverFile", "coverUrl", null, "song")) || undefined;
  }
  async function storeMedia(kind: "audio" | "video", file: File, buffer: Buffer, visibility: "public" | "private") {
    try {
      validateUpload(kind, file.type, file.size);
      const key = await savePrivateFile(file.name, buffer);
      const media = await prisma.mediaAsset.create({
        data: {
          kind,
          visibility,
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          storageKey: key,
          uploadedById: user.id,
        },
      });
      return media.id;
    } catch {
      return undefined;
    }
  }

  if (preview) previewMediaId = await storeMedia("audio", preview.file, preview.buffer, "public");
  if (audio) fullAudioMediaId = await storeMedia("audio", audio.file, audio.buffer, "private");
  if (video) fullVideoMediaId = await storeMedia("video", video.file, video.buffer, "private");

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
    coverUrl:
      coverUrl ||
      (await imageFromForm(form, "coverFile", "coverUrl", existing?.coverUrl, "song")) ||
      undefined,
    ...(previewMediaId ? { previewMediaId } : {}),
    ...(fullAudioMediaId ? { fullAudioMediaId } : {}),
    ...(fullVideoMediaId ? { fullVideoMediaId } : {}),
  };

  const songId = await persistEntity("songs", id, data, async (recordId) =>
    id ? prisma.song.update({ where: { id }, data }) : prisma.song.create({ data: { ...data, id: recordId } }),
  );

  await audit({ userId: user.id, action: id ? "update" : "create", entity: "song", entityId: songId });
  }, id ? `/admin/music/${id}` : "/admin/music/new");
}

export async function saveProduct(form: FormData) {
  const id = String(form.get("id") || "");
  await runAdminSave("/admin/products", async () => {
  const user = await requirePermission("products.manage");
  const existing = id ? await prisma.product.findUnique({ where: { id } }) : null;
  const name = String(form.get("name"));
  const images = [] as string[];
  for (const [key, value] of form.entries()) {
    if (key === "images" && value instanceof File && value.size) {
      const extra = new FormData();
      extra.set("photoFile", value);
      const url = await imageFromForm(extra, "photoFile", "photoUrl", null, "product");
      if (url) images.push(url);
    }
  }
  const currentImages = parseJson<string[]>(existing?.images, []);
  const mainImage = await imageFromForm(form, "photoFile", "photoUrl", currentImages[0], "product");
  const extraUrls = String(form.get("imageUrls") || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((url) => withCacheBust(url));
  const nextImages = images.length
    ? images
    : [mainImage, ...extraUrls.filter((url) => url !== mainImage)].filter(Boolean) as string[];
  const data = {
    name,
    slug: existing?.slug || toSlug(String(form.get("slug") || name)),
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
    ...(nextImages.length ? { images: JSON.stringify(nextImages) } : {}),
  };
  const stored = {
    ...data,
    images: nextImages.length ? JSON.stringify(nextImages) : existing?.images,
  };
  const productId = await persistEntity("products", id, stored, async (recordId) =>
    id ? prisma.product.update({ where: { id }, data }) : prisma.product.create({ data: { ...data, id: recordId } }),
  );
  await audit({ userId: user.id, action: id ? "update" : "create", entity: "product", entityId: productId });
  }, id ? `/admin/products/${id}` : "/admin/products/new");
}

export async function updateOrderStatus(form: FormData) {
  const id = String(form.get("id"));
  await runAdminSave(`/admin/orders/${id}`, async () => {
    const user = await requirePermission("orders.manage");
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
  });
}

export async function deleteSong(form: FormData) {
  await runAdminSave("/admin/music", async () => {
    const user = await requirePermission("music.manage");
    const id = String(form.get("id"));
    await rememberEntity("songs", id, { published: false, accessType: "hidden" });
    try {
      await prisma.song.update({ where: { id }, data: { published: false, accessType: "hidden" } });
    } catch {
      /* overlay already hides the song */
    }
    await audit({ userId: user.id, action: "unpublish", entity: "song", entityId: id });
  });
}

export async function deleteProduct(form: FormData) {
  await runAdminSave("/admin/products", async () => {
    const user = await requirePermission("products.manage");
    const id = String(form.get("id"));
    await rememberEntity("products", id, { status: "archived" });
    try {
      await prisma.product.update({ where: { id }, data: { status: "archived" } });
    } catch {
      /* overlay already archives the product */
    }
    await audit({ userId: user.id, action: "archive", entity: "product", entityId: id });
  });
}
