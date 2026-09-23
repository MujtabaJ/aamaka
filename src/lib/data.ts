import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getPublishedSongFilters() {
  const now = new Date();
  return {
    published: true,
    OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }, { earlyAccess: true }],
    accessType: { not: "hidden" },
  };
}

export async function getHomeData() {
  noStore();
  const [heroes, announcement, songs, exclusive, albums, products, books, artists, articles, plans, genres] =
    await Promise.all([
      prisma.homepageHero.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      prisma.announcement.findFirst({ where: { active: true }, orderBy: { id: "desc" } }),
      prisma.song.findMany({
        where: { published: true, accessType: { not: "hidden" } },
        include: { artist: true, genre: true, album: true },
        orderBy: [{ featured: "desc" }, { releaseDate: "desc" }, { createdAt: "desc" }],
        take: 12,
      }),
      prisma.song.findMany({
        where: { published: true, exclusive: true },
        include: { artist: true, genre: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.album.findMany({
        where: { published: true, featured: true },
        include: { artist: true, tracks: true },
        orderBy: { releaseDate: "desc" },
        take: 6,
      }),
      prisma.product.findMany({
        where: { status: "published", featured: true },
        include: { category: true },
        take: 8,
      }),
      prisma.book.findMany({
        where: { published: true, featured: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.artist.findMany({
        where: { published: true, featured: true },
        take: 8,
      }),
      prisma.article.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
      prisma.membershipPlan.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      prisma.genre.findMany({ where: { published: true } }),
    ]);

  return {
    heroes,
    announcement,
    songs,
    exclusive,
    albums,
    products,
    books,
    artists,
    articles,
    plans,
    genres,
  };
}

export async function searchAll(q: string) {
  const query = q.trim();
  if (query.length < 2) {
    return { songs: [], albums: [], artists: [], products: [], articles: [], books: [] };
  }
  const [songs, albums, artists, products, articles, books] = await Promise.all([
    prisma.song.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query } },
          { titleSd: { contains: query } },
          { titleEn: { contains: query } },
          { singer: { contains: query } },
        ],
      },
      include: { artist: true },
      take: 8,
    }),
    prisma.album.findMany({
      where: {
        published: true,
        OR: [{ title: { contains: query } }, { titleSd: { contains: query } }],
      },
      include: { artist: true },
      take: 6,
    }),
    prisma.artist.findMany({
      where: {
        published: true,
        OR: [{ name: { contains: query } }, { nameSd: { contains: query } }],
      },
      take: 6,
    }),
    prisma.product.findMany({
      where: {
        status: "published",
        OR: [
          { name: { contains: query } },
          { nameSd: { contains: query } },
          { nameEn: { contains: query } },
        ],
      },
      take: 6,
    }),
    prisma.article.findMany({
      where: {
        published: true,
        OR: [{ title: { contains: query } }, { titleSd: { contains: query } }],
      },
      take: 4,
    }),
    prisma.book.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query } },
          { titleSd: { contains: query } },
          { author: { contains: query } },
        ],
      },
      take: 6,
    }),
  ]);
  return { songs, albums, artists, products, articles, books };
}

export async function nextOrderNumber() {
  const count = await prisma.order.count();
  return `AAM-${String(count + 1).padStart(5, "0")}`;
}

export async function setLocaleCookie(locale: "en" | "sd") {
  const jar = await cookies();
  jar.set("aamaka_lang", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}
