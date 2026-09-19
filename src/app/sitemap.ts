import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [songs, albums, artists, products, articles, pages, books] = await Promise.all([
    prisma.song.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.album.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.artist.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.product.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
    prisma.article.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.sitePage.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.book.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticPaths = ["", "/music", "/albums", "/artists", "/shop", "/books", "/membership", "/about", "/stories", "/contact", "/faq"];
  return [
    ...staticPaths.map((path) => ({ url: siteUrl(path || "/"), lastModified: new Date() })),
    ...songs.map((s) => ({ url: siteUrl(`/music/song/${s.slug}`), lastModified: s.updatedAt })),
    ...albums.map((s) => ({ url: siteUrl(`/music/album/${s.slug}`), lastModified: s.updatedAt })),
    ...artists.map((s) => ({ url: siteUrl(`/music/artist/${s.slug}`), lastModified: s.updatedAt })),
    ...products.map((s) => ({ url: siteUrl(`/shop/${s.slug}`), lastModified: s.updatedAt })),
    ...books.map((s) => ({ url: siteUrl(`/books/${s.slug}`), lastModified: s.updatedAt })),
    ...articles.map((s) => ({ url: siteUrl(`/stories/${s.slug}`), lastModified: s.updatedAt })),
    ...pages
      .filter((s) => s.slug !== "about")
      .map((s) => ({ url: siteUrl(`/policies/${s.slug}`), lastModified: s.updatedAt })),
  ];
}
