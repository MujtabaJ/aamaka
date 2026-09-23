"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { toSlug } from "@/lib/utils";
import { rupeesToPaisa } from "@/lib/money";
import { imageFromForm } from "@/lib/admin-images";
import { getHomepageSections, saveHomepageSections, type HomepageSection, type HomepageSectionKey } from "@/lib/homepage";
import { revalidatePath } from "next/cache";
import { failSave, finishSave, isRedirectError, runAdminSave } from "@/lib/admin-save";

export async function saveArtist(form: FormData) {
  const id = String(form.get("id") || "");
  await runAdminSave("/admin/artists", async () => {
    await requirePermission("music.manage");
    const name = String(form.get("name"));
    const existing = id ? await prisma.artist.findUnique({ where: { id } }) : null;
    const photoUrl = await imageFromForm(form, "photoFile", "photoUrl", existing?.photoUrl);
    const coverUrl = await imageFromForm(form, "coverFile", "coverUrl", existing?.coverUrl || photoUrl);
    const data = {
      name,
      slug: existing?.slug || toSlug(name),
      nameSd: String(form.get("nameSd") || "") || null,
      biography: String(form.get("biography") || ""),
      photoUrl,
      coverUrl,
      featured: form.get("featured") === "on",
      published: form.get("published") === "on" || !id,
    };
    if (id) await prisma.artist.update({ where: { id }, data });
    else await prisma.artist.create({ data });
  }, id ? `/admin/artists/${id}` : "/admin/artists/new");
}

export async function deleteArtist(form: FormData) {
  await runAdminSave("/admin/artists", async () => {
    await requirePermission("music.manage");
    const id = String(form.get("id"));
    const artist = await prisma.artist.findUnique({ where: { id } });
    if (artist) {
      await prisma.artist.update({ where: { id }, data: { published: false } });
      revalidatePath(`/music/artist/${artist.slug}`);
    }
  });
}

export async function saveAlbum(form: FormData) {
  const id = String(form.get("id") || "");
  await runAdminSave("/admin/albums", async () => {
    await requirePermission("music.manage");
    const title = String(form.get("title"));
    const existing = id ? await prisma.album.findUnique({ where: { id } }) : null;
    const data = {
      title,
      slug: existing?.slug || toSlug(title),
      description: String(form.get("description") || ""),
      artistId: String(form.get("artistId") || "") || null,
      coverUrl: await imageFromForm(form, "coverFile", "coverUrl", existing?.coverUrl),
      pricePaisa: rupeesToPaisa(Number(form.get("price") || 0)),
      published: form.get("published") === "on" || !id,
    };
    if (id) await prisma.album.update({ where: { id }, data });
    else await prisma.album.create({ data: { ...data, accessType: "paid" } });
  }, id ? `/admin/albums/${id}` : "/admin/albums/new");
}

export async function deleteAlbum(form: FormData) {
  await runAdminSave("/admin/albums", async () => {
    await requirePermission("music.manage");
    await prisma.album.update({ where: { id: String(form.get("id")) }, data: { published: false } });
    revalidatePath("/admin/albums");
    revalidatePath("/albums");
  });
}

export async function saveBook(form: FormData) {
  const id = String(form.get("id") || "");
  await runAdminSave("/admin/books", async () => {
    await requirePermission("content.manage");
    const title = String(form.get("title"));
    const existing = id ? await prisma.book.findUnique({ where: { id } }) : null;
    const data = {
      title,
      slug: existing?.slug || toSlug(title),
      titleSd: String(form.get("titleSd") || "") || null,
      author: String(form.get("author")),
      category: String(form.get("category") || "poetry"),
      format: String(form.get("format") || existing?.format || "paperback"),
      language: String(form.get("language") || existing?.language || "Sindhi"),
      description: String(form.get("description") || ""),
      excerpt: String(form.get("excerpt") || "") || null,
      coverUrl: await imageFromForm(form, "coverFile", "coverUrl", existing?.coverUrl),
      pricePaisa: rupeesToPaisa(Number(form.get("price") || 0)),
      stock: Number(form.get("stock") || 0),
      featured: form.get("featured") === "on",
      published: form.get("published") === "on" || !id,
    };
    if (id) await prisma.book.update({ where: { id }, data });
    else await prisma.book.create({ data });
  }, id ? `/admin/books/${id}` : "/admin/books/new");
}

export async function deleteBook(form: FormData) {
  await runAdminSave("/admin/books", async () => {
    await requirePermission("content.manage");
    const id = String(form.get("id"));
    const used = await prisma.orderItem.count({ where: { bookId: id } });
    if (used === 0) await prisma.book.delete({ where: { id } });
    else await prisma.book.update({ where: { id }, data: { published: false } });
    revalidatePath("/admin/books");
    revalidatePath("/books");
  });
}

export async function saveArticle(form: FormData) {
  const id = String(form.get("id") || "");
  await runAdminSave("/admin/articles", async () => {
  const user = await requirePermission("content.manage");
  const title = String(form.get("title"));
  const existing = id ? await prisma.article.findUnique({ where: { id } }) : null;
  const data = {
    title,
    slug: existing?.slug || toSlug(title),
    excerpt: String(form.get("excerpt") || ""),
    body: String(form.get("body") || ""),
    coverUrl: await imageFromForm(form, "coverFile", "coverUrl", existing?.coverUrl),
    published: form.get("published") === "on" || !id,
  };
  if (id) await prisma.article.update({ where: { id }, data });
  else {
    await prisma.article.create({
      data: {
        ...data,
        authorId: user.id,
        authorName: user.name ?? "AA Maka Production",
        publishedAt: new Date(),
      },
    });
  }
  }, id ? `/admin/articles/${id}` : "/admin/articles/new");
}

export async function deleteArticle(form: FormData) {
  await runAdminSave("/admin/articles", async () => {
    await requirePermission("content.manage");
    await prisma.article.delete({ where: { id: String(form.get("id")) } });
    revalidatePath("/admin/articles");
    revalidatePath("/stories");
  });
}

export async function saveFaq(form: FormData) {
  const id = String(form.get("id") || "");
  await runAdminSave("/admin/faqs", async () => {
    await requirePermission("content.manage");
    const data = {
      question: String(form.get("question")),
      answer: String(form.get("answer")),
      sortOrder: Number(form.get("sortOrder") || 0),
      published: form.get("published") === "on" || !id,
    };
    if (id) await prisma.faq.update({ where: { id }, data });
    else await prisma.faq.create({ data });
  }, id ? `/admin/faqs/${id}` : "/admin/faqs/new");
}

export async function deleteFaq(form: FormData) {
  await runAdminSave("/admin/faqs", async () => {
    await requirePermission("content.manage");
    await prisma.faq.delete({ where: { id: String(form.get("id")) } });
  });
}

export async function saveCategory(form: FormData) {
  const id = String(form.get("id") || "");
  await runAdminSave("/admin/categories", async () => {
    await requirePermission("products.manage");
    const name = String(form.get("name"));
    const existing = id ? await prisma.productCategory.findUnique({ where: { id } }) : null;
    const data = {
      name,
      slug: existing?.slug || toSlug(name),
      description: String(form.get("description") || "") || null,
      imageUrl: await imageFromForm(form, "photoFile", "photoUrl", existing?.imageUrl),
      parentId: String(form.get("parentId") || "") || null,
      published: form.get("published") === "on" || !id,
    };
    if (id) await prisma.productCategory.update({ where: { id }, data });
    else await prisma.productCategory.create({ data });
  }, id ? `/admin/categories/${id}` : "/admin/categories/new");
}

export async function deleteCategory(form: FormData) {
  await runAdminSave("/admin/categories", async () => {
    await requirePermission("products.manage");
    await prisma.productCategory.update({ where: { id: String(form.get("id")) }, data: { published: false } });
  });
}

export async function savePlan(form: FormData) {
  const id = String(form.get("id") || "");
  await runAdminSave("/admin/memberships", async () => {
    await requirePermission("memberships.manage");
    const name = String(form.get("name"));
    const existing = id ? await prisma.membershipPlan.findUnique({ where: { id } }) : null;
    const data = {
      name,
      slug: existing?.slug || toSlug(name),
      description: String(form.get("description") || ""),
      interval: String(form.get("interval") || "monthly"),
      pricePaisa: rupeesToPaisa(Number(form.get("price") || 0)),
      trialDays: Number(form.get("trialDays") || 0),
      features: JSON.stringify(String(form.get("features") || "").split("\n").filter(Boolean)),
      active: form.get("active") === "on" || !id,
    };
    if (id) await prisma.membershipPlan.update({ where: { id }, data });
    else await prisma.membershipPlan.create({ data });
  }, id ? `/admin/memberships/${id}` : "/admin/memberships/new");
}

export async function deletePlan(form: FormData) {
  await runAdminSave("/admin/memberships", async () => {
    await requirePermission("memberships.manage");
    await prisma.membershipPlan.update({ where: { id: String(form.get("id")) }, data: { active: false } });
  });
}

export async function saveHomepageSection(form: FormData) {
  const id = String(form.get("id"));
  await runAdminSave("/admin/homepage", async () => {
    await requirePermission("content.manage");
    const current = await getHomepageSections();
    const existing = current.find((section) => section.id === id);
    const next: HomepageSection = {
      id,
      key: (existing?.key || "custom") as HomepageSectionKey,
      eyebrow: String(form.get("eyebrow") || ""),
      title: String(form.get("title") || ""),
      subtitle: String(form.get("subtitle") || ""),
      imageUrl: (await imageFromForm(form, "photoFile", "photoUrl", existing?.imageUrl)) || "",
      ctaLabel: String(form.get("ctaLabel") || ""),
      ctaHref: String(form.get("ctaHref") || ""),
      visible: form.get("visible") === "on",
      sortOrder: Number(form.get("sortOrder") || existing?.sortOrder || 0),
    };
    await saveHomepageSections(current.map((section) => (section.id === id ? next : section)));
  }, `/admin/homepage/section/${id}`);
}

export async function saveHero(form: FormData) {
  const id = String(form.get("id") || "");
  await runAdminSave("/admin/homepage", async () => {
    await requirePermission("content.manage");
    const existing = id ? await prisma.homepageHero.findUnique({ where: { id } }) : null;
    const data = {
      kicker: String(form.get("kicker") || ""),
      title: String(form.get("title") || ""),
      subtitle: String(form.get("subtitle") || ""),
      imageUrl: (await imageFromForm(form, "photoFile", "photoUrl", existing?.imageUrl)) || "/media/covers/hero.svg",
      ctaPrimaryLabel: String(form.get("ctaPrimaryLabel") || "Listen Now"),
      ctaPrimaryHref: String(form.get("ctaPrimaryHref") || "/music"),
      ctaSecondaryLabel: String(form.get("ctaSecondaryLabel") || "Explore Music"),
      ctaSecondaryHref: String(form.get("ctaSecondaryHref") || "/music"),
      ctaTertiaryLabel: String(form.get("ctaTertiaryLabel") || "Become a Member"),
      ctaTertiaryHref: String(form.get("ctaTertiaryHref") || "/membership"),
      ctaQuaternaryLabel: String(form.get("ctaQuaternaryLabel") || "Shop Sindhi Culture"),
      ctaQuaternaryHref: String(form.get("ctaQuaternaryHref") || "/shop"),
      active: form.get("active") === "on" || !id,
    };
    if (id) await prisma.homepageHero.update({ where: { id }, data });
    else await prisma.homepageHero.create({ data });
  }, id ? `/admin/homepage/hero/${id}` : "/admin/homepage/hero/new");
}

export async function deleteHero(form: FormData) {
  await runAdminSave("/admin/homepage", async () => {
    await requirePermission("content.manage");
    await prisma.homepageHero.delete({ where: { id: String(form.get("id")) } });
  });
}

export async function addCustomSection() {
  try {
    await requirePermission("content.manage");
    const current = await getHomepageSections();
    const id = `custom-${Date.now()}`;
    await saveHomepageSections([
      ...current,
      {
        id,
        key: "custom",
        eyebrow: "New section",
        title: "Untitled section",
        subtitle: "Add a title, description and picture.",
        imageUrl: "",
        ctaLabel: "Learn more",
        ctaHref: "/",
        visible: true,
        sortOrder: (current.at(-1)?.sortOrder ?? 100) + 10,
      },
    ]);
    finishSave(`/admin/homepage/section/${id}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    failSave("/admin/homepage", error);
  }
}

export async function deleteHomepageSection(form: FormData) {
  await runAdminSave("/admin/homepage", async () => {
    await requirePermission("content.manage");
    const id = String(form.get("id"));
    const current = await getHomepageSections();
    const section = current.find((item) => item.id === id);
    if (section?.key === "custom") {
      await saveHomepageSections(current.filter((item) => item.id !== id));
    } else {
      await saveHomepageSections(current.map((item) => (item.id === id ? { ...item, visible: false } : item)));
    }
  });
}

export async function saveAnnouncement(form: FormData) {
  const id = String(form.get("id") || "");
  await runAdminSave("/admin/homepage", async () => {
    await requirePermission("content.manage");
    const data = {
      message: String(form.get("message") || ""),
      href: String(form.get("href") || "") || null,
      active: form.get("active") === "on" || !id,
    };
    if (id) await prisma.announcement.update({ where: { id }, data });
    else await prisma.announcement.create({ data });
  }, id ? `/admin/homepage/announcement/${id}` : "/admin/homepage/announcement/new");
}

export async function deleteAnnouncement(form: FormData) {
  await runAdminSave("/admin/homepage", async () => {
    await requirePermission("content.manage");
    await prisma.announcement.delete({ where: { id: String(form.get("id")) } });
  });
}

export async function savePage(form: FormData) {
  const slug = String(form.get("slug") || "");
  await runAdminSave("/admin/homepage", async () => {
    await requirePermission("content.manage");
    const data = { slug, title: String(form.get("title")), body: String(form.get("body")) };
    await prisma.sitePage.upsert({ where: { slug }, update: data, create: data });
  }, slug ? `/admin/homepage/page/${slug}` : "/admin/homepage/page/new");
}

export async function deletePage(form: FormData) {
  await runAdminSave("/admin/homepage", async () => {
    await requirePermission("content.manage");
    await prisma.sitePage.delete({ where: { slug: String(form.get("slug")) } });
  });
}

export async function saveCoupon(form: FormData) {
  const id = String(form.get("id") || "");
  await runAdminSave("/admin/coupons", async () => {
    await requirePermission("coupons.manage");
    const data = {
      code: String(form.get("code")).toUpperCase(),
      type: String(form.get("type") || "percent"),
      value: Number(form.get("value") || 0),
      minOrderPaisa: rupeesToPaisa(Number(form.get("minOrder") || 0)),
      memberOnly: form.get("memberOnly") === "on",
      firstOrderOnly: form.get("firstOrderOnly") === "on",
      usageLimit: form.get("usageLimit") ? Number(form.get("usageLimit")) : null,
      active: form.get("active") === "on" || !id,
    };
    if (id) await prisma.coupon.update({ where: { id }, data });
    else await prisma.coupon.create({ data });
  }, id ? `/admin/coupons/${id}` : "/admin/coupons/new");
}

export async function deleteCoupon(form: FormData) {
  await runAdminSave("/admin/coupons", async () => {
    await requirePermission("coupons.manage");
    await prisma.coupon.update({ where: { id: String(form.get("id")) }, data: { active: false } });
  });
}

export async function saveUser(form: FormData) {
  const id = String(form.get("id") || "");
  await runAdminSave("/admin/users", async () => {
    await requirePermission("users.manage");
    const existing = id ? await prisma.user.findUnique({ where: { id } }) : null;
    const password = String(form.get("password") || "");
    const data = {
      name: String(form.get("name")),
      email: String(form.get("email")).toLowerCase(),
      roleId: String(form.get("roleId")),
      status: String(form.get("status") || "active"),
      phone: String(form.get("phone") || "") || null,
      image: await imageFromForm(form, "photoFile", "photoUrl", existing?.image),
      ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
    };
    if (id) await prisma.user.update({ where: { id }, data });
    else {
      if (!password) throw new Error("Password is required");
      await prisma.user.create({ data: { ...data, passwordHash: await bcrypt.hash(password, 12) } });
    }
  }, id ? `/admin/users/${id}` : "/admin/users/new");
}

export async function deleteUser(form: FormData) {
  await runAdminSave("/admin/users", async () => {
    await requirePermission("users.manage");
    await prisma.user.update({ where: { id: String(form.get("id")) }, data: { status: "disabled" } });
  });
}
