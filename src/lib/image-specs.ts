export type ImageSpecKey =
  | "hero"
  | "section"
  | "artistPhoto"
  | "artistCover"
  | "album"
  | "book"
  | "article"
  | "product"
  | "category"
  | "song"
  | "avatar";

export type ImageSpec = {
  width: number;
  height: number;
  dpi: string;
  ratio: string;
  previewClass: string;
};

export const IMAGE_SPECS: Record<ImageSpecKey, ImageSpec> = {
  hero: {
    width: 1920,
    height: 1080,
    dpi: "72–150 DPI",
    ratio: "16:9",
    previewClass: "h-40 w-full max-w-xl rounded-3xl",
  },
  section: {
    width: 1600,
    height: 900,
    dpi: "72–150 DPI",
    ratio: "16:9",
    previewClass: "h-36 w-full max-w-lg rounded-3xl",
  },
  artistPhoto: {
    width: 800,
    height: 1000,
    dpi: "72–150 DPI",
    ratio: "4:5",
    previewClass: "h-52 w-40 rounded-3xl",
  },
  artistCover: {
    width: 1920,
    height: 800,
    dpi: "72–150 DPI",
    ratio: "12:5",
    previewClass: "h-32 w-full max-w-xl rounded-3xl",
  },
  album: {
    width: 1400,
    height: 1400,
    dpi: "72–300 DPI",
    ratio: "1:1",
    previewClass: "h-52 w-52 rounded-3xl",
  },
  book: {
    width: 1200,
    height: 1600,
    dpi: "150–300 DPI",
    ratio: "3:4",
    previewClass: "h-64 w-48 rounded-3xl",
  },
  article: {
    width: 1600,
    height: 900,
    dpi: "72–150 DPI",
    ratio: "16:9",
    previewClass: "h-36 w-full max-w-lg rounded-3xl",
  },
  product: {
    width: 1400,
    height: 1400,
    dpi: "72–150 DPI",
    ratio: "1:1",
    previewClass: "h-52 w-52 rounded-3xl",
  },
  category: {
    width: 1200,
    height: 800,
    dpi: "72–150 DPI",
    ratio: "3:2",
    previewClass: "h-40 w-56 rounded-3xl",
  },
  song: {
    width: 1400,
    height: 1400,
    dpi: "72–300 DPI",
    ratio: "1:1",
    previewClass: "h-52 w-52 rounded-3xl",
  },
  avatar: {
    width: 400,
    height: 400,
    dpi: "72–150 DPI",
    ratio: "1:1",
    previewClass: "h-36 w-36 rounded-3xl",
  },
};

export function specLine(key: ImageSpecKey) {
  const spec = IMAGE_SPECS[key];
  return `${spec.width} × ${spec.height} px · ${spec.ratio} · ${spec.dpi}`;
}

export function recommendedLine(key: ImageSpecKey) {
  const spec = IMAGE_SPECS[key];
  return `Recommended: ${spec.width} × ${spec.height} px · ${spec.ratio} · ${spec.dpi}`;
}

export function freshSrc(url?: string | null, version?: Date | number | string | null) {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  const stamp =
    version instanceof Date ? String(version.getTime()) : version != null && version !== "" ? String(version) : "";
  if (!stamp) return url;
  const clean = url.replace(/([?&])v=\d+/g, "").replace(/[?&]$/, "");
  return `${clean}${clean.includes("?") ? "&" : "?"}v=${stamp}`;
}
