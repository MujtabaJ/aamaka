"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { toSlug } from "@/lib/utils";
import { rupeesToPaisa } from "@/lib/money";
import { imageFromForm } from "@/lib/admin-images";
import { forgetEntity, persistEntity, rememberEntity } from "@/lib/cms-overlay";
import { getHomepageSections, saveHomepageSections, type HomepageSection, type HomepageSectionKey } from "@/lib/homepage";
import { revalidatePath } from "next/cache";
import { failSave, finishSave, isRedirectError, runAdminSave } from "@/lib/admin-save";

export async function saveArtist(form: FormData) {
  const id = String(form.get("id") || "");
  await runAdminSave("/admin/artists", async () => {
    await requirePermission("music.manage");
    const name = String(form.get("name"));
    const existing = id ? await prisma.artist.findUnique({ where: { id } }) : null;
    const photoUrl = await imageFromForm(form, "photoFile", "photoUrl", existing?.photoUrl, "artistPhoto");
    const coverUrl = await imageFromForm(form, "coverFile", "coverUrl", existing?.coverUrl || photoUrl, "artistCover");
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
    await persistEntity("artists", id, data, async (recordId) =>
      id ? prisma.artist.update({ where: { id }, data }) : prisma.artist.create({ data: { ...data, id: recordId } }),
    );
  }, id ? `/admin/artists/${id}` : "/admin/artists/new");
}

export async function deleteArtist(form: FormData) {
  await runAdminSave("/admin/artists", async () => {
    await requirePermission("music.manage");
    const id = String(form.get("id"));
    const artist = await prisma.artist.findUnique({ where: { id } });
    await rememberEntity("artists", id, { published: false });
    if (artist) {
      try {
        await prisma.artist.update({ where: { id }, data: { published: false } });
      } catch {
        /* overlay already hides the artist */
      }
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
      coverUrl: await imageFromForm(form, "coverFile", "coverUrl", existing?.coverUrl, "album"),
      pricePaisa: rupeesToPaisa(Number(form.get("price") || 0)),
      published: form.get("published") === "on" || !id,
    };
    await persistEntity("albums", id, { ...data, accessType: existing?.accessType || "paid" }, async (recordId) =>
      id
        ? prisma.album.update({ where: { id }, data })
        : prisma.album.create({ data: { ...data, accessType: "paid", id: recordId } }),
    );
  }, id ? `/admin/albums/${id}` : "/admin/albums/new");
}

export async function deleteAlbum(form: FormData) {
  await runAdminSave("/admin/albums", async () => {
    await requirePermission("music.manage");
    const albumId = String(form.get("id"));
    await rememberEntity("albums", albumId, { published: false });
    try {
      await prisma.album.update({ where: { id: albumId }, data: { published: false } });
    } catch {
      /* overlay already hides the album */
    }
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
      coverUrl: await imageFromForm(form, "coverFile", "coverUrl", existing?.coverUrl, "book"),
      pricePaisa: rupeesToPaisa(Number(form.get("price") || 0)),
      stock: Number(form.get("stock") || 0),
      featured: form.get("featured") === "on",
      published: form.get("published") === "on" || !id,
    };
    await persistEntity("books", id, data, async (recordId) =>
      id ? prisma.book.update({ where: { id }, data }) : prisma.book.create({ data: { ...data, id: recordId } }),
    );
  }, id ? `/admin/books/${id}` : "/admin/books/new");
}

export async function deleteBook(form: FormData) {
  await runAdminSave("/admin/books", async () => {
    await requirePermission("content.manage");
    const id = String(form.get("id"));
    await rememberEntity("books", id, { published: false });
    try {
      const used = await prisma.orderItem.count({ where: { bookId: id } });
      if (used === 0) {
        await prisma.book.delete({ where: { id } });
        await forgetEntity("books", id);
      } else {
        await prisma.book.update({ where: { id }, data: { published: false } });
      }
    } catch {
      await forgetEntity("books", id);
    }
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
    coverUrl: await imageFromForm(form, "coverFile", "coverUrl", existing?.coverUrl, "article"),
    published: form.get("published") === "on" || !id,
  };
  const extra = {
    ...data,
    authorId: user.id,
    authorName: user.name ?? "AA Maka Production",
    publishedAt: existing?.publishedAt ?? new Date(),
  };
  await persistEntity("articles", id, extra, async (recordId) =>
    id
      ? prisma.article.update({ where: { id }, data })
      : prisma.article.create({ data: { ...extra, id: recordId } }),
  );
  }, id ? `/admin/articles/${id}` : "/admin/articles/new");
}

export async function deleteArticle(form: FormData) {
  await runAdminSave("/admin/articles", async () => {
    await requirePermission("content.manage");
    const articleId = String(form.get("id"));
    await forgetEntity("articles", articleId);
    try {
      await prisma.article.delete({ where: { id: articleId } });
    } catch {
      /* overlay already removed the article */
    }
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
    await persistEntity("faqs", id, data, async (recordId) =>
      id ? prisma.faq.update({ where: { id }, data }) : prisma.faq.create({ data: { ...data, id: recordId } }),
    );
  }, id ? `/admin/faqs/${id}` : "/admin/faqs/new");
}

export async function deleteFaq(form: FormData) {
  await runAdminSave("/admin/faqs", async () => {
    await requirePermission("content.manage");
    const faqId = String(form.get("id"));
    await forgetEntity("faqs", faqId);
    try {
      await prisma.faq.delete({ where: { id: faqId } });
    } catch {
      /* overlay already removed the FAQ */
    }
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
      imageUrl: await imageFromForm(form, "photoFile", "photoUrl", existing?.imageUrl, "category"),
      parentId: String(form.get("parentId") || "") || null,
      published: form.get("published") === "on" || !id,
    };
    await persistEntity("categories", id, data, async (recordId) =>
      id
        ? prisma.productCategory.update({ where: { id }, data })
        : prisma.productCategory.create({ data: { ...data, id: recordId } }),
    );
  }, id ? `/admin/categories/${id}` : "/admin/categories/new");
}

export async function deleteCategory(form: FormData) {
  await runAdminSave("/admin/categories", async () => {
    await requirePermission("products.manage");
    const categoryId = String(form.get("id"));
    await rememberEntity("categories", categoryId, { published: false });
    try {
      await prisma.productCategory.update({ where: { id: categoryId }, data: { published: false } });
    } catch {
      /* overlay already hides the category */
    }
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
    await persistEntity("plans", id, data, async (recordId) =>
      id
        ? prisma.membershipPlan.update({ where: { id }, data })
        : prisma.membershipPlan.create({ data: { ...data, id: recordId } }),
    );
  }, id ? `/admin/memberships/${id}` : "/admin/memberships/new");
}

export async function deletePlan(form: FormData) {
  await runAdminSave("/admin/memberships", async () => {
    await requirePermission("memberships.manage");
    const planId = String(form.get("id"));
    await rememberEntity("plans", planId, { active: false });
    try {
      await prisma.membershipPlan.update({ where: { id: planId }, data: { active: false } });
    } catch {
      /* overlay already hides the plan */
    }
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
      imageUrl: (await imageFromForm(form, "photoFile", "photoUrl", existing?.imageUrl, "section")) || "",
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
      imageUrl: (await imageFromForm(form, "photoFile", "photoUrl", existing?.imageUrl, "hero")) || "/media/covers/hero.svg",
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
    await persistEntity("heroes", id, data, async (recordId) =>
      id
        ? prisma.homepageHero.update({ where: { id }, data })
        : prisma.homepageHero.create({ data: { ...data, id: recordId } }),
    );
  }, id ? `/admin/homepage/hero/${id}` : "/admin/homepage/hero/new");
}

export async function deleteHero(form: FormData) {
  await runAdminSave("/admin/homepage", async () => {
    await requirePermission("content.manage");
    const heroId = String(form.get("id"));
    await prisma.homepageHero.delete({ where: { id: heroId } });
    await forgetEntity("heroes", heroId);
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
    await persistEntity("announcements", id, data, async (recordId) =>
      id
        ? prisma.announcement.update({ where: { id }, data })
        : prisma.announcement.create({ data: { ...data, id: recordId } }),
    );
  }, id ? `/admin/homepage/announcement/${id}` : "/admin/homepage/announcement/new");
}

export async function deleteAnnouncement(form: FormData) {
  await runAdminSave("/admin/homepage", async () => {
    await requirePermission("content.manage");
    const announcementId = String(form.get("id"));
    await forgetEntity("announcements", announcementId);
    try {
      await prisma.announcement.delete({ where: { id: announcementId } });
    } catch {
      /* overlay already removed the announcement */
    }
  });
}

export async function savePage(form: FormData) {
  const slug = String(form.get("slug") || "");
  await runAdminSave("/admin/homepage", async () => {
    await requirePermission("content.manage");
    const data = { slug, title: String(form.get("title")), body: String(form.get("body")) };
    await persistEntity("pages", slug, data, async () => {
      await prisma.sitePage.upsert({ where: { slug }, update: data, create: data });
      return { id: slug };
    });
  }, slug ? `/admin/homepage/page/${slug}` : "/admin/homepage/page/new");
}

export async function deletePage(form: FormData) {
  await runAdminSave("/admin/homepage", async () => {
    await requirePermission("content.manage");
    const slug = String(form.get("slug"));
    await forgetEntity("pages", slug);
    try {
      await prisma.sitePage.delete({ where: { slug } });
    } catch {
      /* overlay already removed the page */
    }
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
    await persistEntity("coupons", id, data, async (recordId) =>
      id ? prisma.coupon.update({ where: { id }, data }) : prisma.coupon.create({ data: { ...data, id: recordId } }),
    );
  }, id ? `/admin/coupons/${id}` : "/admin/coupons/new");
}

export async function deleteCoupon(form: FormData) {
  await runAdminSave("/admin/coupons", async () => {
    await requirePermission("coupons.manage");
    const couponId = String(form.get("id"));
    await rememberEntity("coupons", couponId, { active: false });
    try {
      await prisma.coupon.update({ where: { id: couponId }, data: { active: false } });
    } catch {
      /* overlay already hides the coupon */
    }
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
      image: await imageFromForm(form, "photoFile", "photoUrl", existing?.image, "avatar"),
      ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
    };
    if (!id && !password) throw new Error("Password is required");
    const safe = { name: data.name, email: data.email, image: data.image, status: data.status, phone: data.phone, roleId: data.roleId };
    await persistEntity("users", id, safe, async (recordId) =>
      id
        ? prisma.user.update({ where: { id }, data })
        : prisma.user.create({ data: { ...data, passwordHash: await bcrypt.hash(password, 12), id: recordId } }),
    );
  }, id ? `/admin/users/${id}` : "/admin/users/new");
}

export async function deleteUser(form: FormData) {
  await runAdminSave("/admin/users", async () => {
    await requirePermission("users.manage");
    const userId = String(form.get("id"));
    await rememberEntity("users", userId, { status: "disabled" });
    try {
      await prisma.user.update({ where: { id: userId }, data: { status: "disabled" } });
    } catch {
      /* overlay already disables the user */
    }
  });
}
