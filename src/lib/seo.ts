import type { Metadata } from "next";
import { siteUrl } from "@/lib/utils";

export { siteUrl };

export function pageMeta(options: {
  title: string;
  description: string;
  path?: string;
  image?: string | null;
  locale?: string;
  type?: "website" | "article" | "music.song" | "music.album" | "product";
}): Metadata {
  const url = siteUrl(options.path ?? "/");
  const image = options.image || siteUrl("/media/og-default.svg");
  const title = options.title.includes("AA Maka")
    ? options.title
    : `${options.title} · AA Maka Production`;

  return {
    title,
    description: options.description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: options.description,
      url,
      siteName: "AA Maka Production",
      locale: options.locale === "sd" ? "sd_PK" : "en_PK",
      type: options.type === "article" ? "article" : "website",
      images: [{ url: image, width: 1200, height: 630, alt: options.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: options.description,
      images: [image],
    },
  };
}

export function jsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  return {
    __html: JSON.stringify(data),
  };
}
