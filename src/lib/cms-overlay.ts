import fs from "fs/promises";
import path from "path";
import type { HomepageSection } from "@/lib/homepage";

export type OverlayBag = Record<string, Record<string, unknown>>;

export type CmsOverlay = {
  updatedAt: number;
  heroes: OverlayBag;
  artists: OverlayBag;
  albums: OverlayBag;
  books: OverlayBag;
  articles: OverlayBag;
  products: OverlayBag;
  categories: OverlayBag;
  songs: OverlayBag;
  users: OverlayBag;
  announcements: OverlayBag;
  pages: OverlayBag;
  faqs: OverlayBag;
  plans: OverlayBag;
  sections?: HomepageSection[];
  settings?: Record<string, unknown>;
};

const EMPTY: CmsOverlay = {
  updatedAt: 0,
  heroes: {},
  artists: {},
  albums: {},
  books: {},
  articles: {},
  products: {},
  categories: {},
  songs: {},
  users: {},
  announcements: {},
  pages: {},
  faqs: {},
  plans: {},
};

const BLOB_PREFIX = "cms/state/";
const MODEL_TO_BAG: Record<string, keyof CmsOverlay> = {
  homepagehero: "heroes",
  artist: "artists",
  album: "albums",
  book: "books",
  article: "articles",
  product: "products",
  productcategory: "categories",
  song: "songs",
  user: "users",
  announcement: "announcements",
  sitepage: "pages",
  faq: "faqs",
  membershipplan: "plans",
};

function bagFor(model: string): keyof CmsOverlay | null {
  return MODEL_TO_BAG[model.replace(/_/g, "").toLowerCase()] ?? null;
}

function localOverlayPath() {
  if (process.env.VERCEL) return "/tmp/aamaka-cms-overlay.json";
  return path.join(process.cwd(), "data", "cms-overlay.json");
}

let memory: { data: CmsOverlay; at: number } | null = null;

function canUseBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID || process.env.VERCEL);
}

function asOverlay(value: unknown): CmsOverlay {
  if (!value || typeof value !== "object") return { ...EMPTY };
  const incoming = value as Partial<CmsOverlay>;
  return {
    updatedAt: Number(incoming.updatedAt) || 0,
    heroes: incoming.heroes ?? {},
    artists: incoming.artists ?? {},
    albums: incoming.albums ?? {},
    books: incoming.books ?? {},
    articles: incoming.articles ?? {},
    products: incoming.products ?? {},
    categories: incoming.categories ?? {},
    songs: incoming.songs ?? {},
    users: incoming.users ?? {},
    announcements: incoming.announcements ?? {},
    pages: incoming.pages ?? {},
    faqs: incoming.faqs ?? {},
    plans: incoming.plans ?? {},
    sections: incoming.sections,
    settings: incoming.settings,
  };
}

function newest(...candidates: Array<CmsOverlay | null>) {
  return candidates
    .filter((item): item is CmsOverlay => Boolean(item))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0] ?? { ...EMPTY };
}

async function readLocal(): Promise<CmsOverlay | null> {
  try {
    const raw = await fs.readFile(localOverlayPath(), "utf8");
    return asOverlay(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function writeLocal(data: CmsOverlay) {
  const file = localOverlayPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data));
}

async function readBlob(): Promise<CmsOverlay | null> {
  if (!canUseBlob()) return null;
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: BLOB_PREFIX, limit: 20 });
    const latest = [...blobs].sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))[0];
    if (!latest) return null;
    const response = await fetch(`${latest.url}${latest.url.includes("?") ? "&" : "?"}v=${Date.now()}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return asOverlay(await response.json());
  } catch {
    return null;
  }
}

async function writeBlob(data: CmsOverlay) {
  if (!canUseBlob()) return;
  const { put } = await import("@vercel/blob");
  await put(`${BLOB_PREFIX}${data.updatedAt}.json`, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export function invalidateCmsOverlay() {
  memory = null;
}

export async function loadCmsOverlay(): Promise<CmsOverlay> {
  if (memory && Date.now() - memory.at < 1000) return memory.data;
  const [remote, local] = await Promise.all([readBlob(), readLocal()]);
  const data = newest(remote, local);
  memory = { data, at: Date.now() };
  return data;
}

export async function saveCmsOverlay(data: CmsOverlay) {
  const next = { ...data, updatedAt: Date.now() };
  memory = { data: next, at: Date.now() };
  await writeLocal(next);
  try {
    await writeBlob(next);
  } catch {
    try {
      await writeBlob(next);
    } catch {
      /* local copy still keeps this instance consistent */
    }
  }
}

export async function rememberEntity(bag: keyof Omit<CmsOverlay, "sections" | "settings" | "updatedAt">, id: string, fields: Record<string, unknown>) {
  if (!id) return;
  const current = await loadCmsOverlay();
  current[bag] = {
    ...current[bag],
    [id]: { ...(current[bag][id] ?? {}), ...fields, id },
  };
  await saveCmsOverlay(current);
}

export async function rememberSections(sections: HomepageSection[]) {
  const current = await loadCmsOverlay();
  current.sections = sections;
  await saveCmsOverlay(current);
}

export async function rememberSettings(settings: Record<string, unknown>) {
  const current = await loadCmsOverlay();
  current.settings = { ...(current.settings ?? {}), ...settings };
  await saveCmsOverlay(current);
}

export async function forgetEntity(bag: keyof Omit<CmsOverlay, "sections" | "settings" | "updatedAt">, id: string) {
  const current = await loadCmsOverlay();
  if (!current[bag][id]) return;
  const next = { ...current[bag] };
  delete next[id];
  current[bag] = next;
  await saveCmsOverlay(current);
}

function mergeRow<T>(row: T, extra?: Record<string, unknown> | null): T {
  if (!extra || !row || typeof row !== "object") return row;
  return { ...row, ...extra } as T;
}

export function applyBag<T extends { id?: string; slug?: string }>(rows: T[], bag: OverlayBag): T[] {
  return rows.map((row) => {
    const extra = (row.id && bag[row.id]) || (row.slug && bag[row.slug]) || null;
    return mergeRow(row, extra);
  });
}

export async function hydrateRecord<T>(model: string, row: T): Promise<T> {
  if (!row || typeof row !== "object") return row;
  const overlay = await loadCmsOverlay();
  if (model.toLowerCase() === "sitesetting") {
    const setting = row as { key?: string; value?: string };
    if (setting.key === "homepage" && overlay.sections) {
      return { ...row, value: JSON.stringify({ sections: overlay.sections }) };
    }
    if (setting.key === "site" && overlay.settings) {
      return { ...row, value: JSON.stringify(overlay.settings) };
    }
    return row;
  }
  const bagName = bagFor(model);
  if (!bagName || bagName === "sections" || bagName === "settings" || bagName === "updatedAt") return row;
  const record = row as { id?: unknown; slug?: unknown };
  const extra = overlay[bagName][String(record.id ?? "")] || overlay[bagName][String(record.slug ?? "")];
  return mergeRow(row, extra);
}

export async function hydrateRecords<T>(model: string, rows: T[]): Promise<T[]> {
  if (!Array.isArray(rows) || rows.length === 0) return rows;
  if (model.toLowerCase() === "sitesetting") {
    return Promise.all(rows.map((row) => hydrateRecord(model, row)));
  }
  const overlay = await loadCmsOverlay();
  const bagName = bagFor(model);
  if (!bagName || bagName === "sections" || bagName === "settings" || bagName === "updatedAt") return rows;
  const bag = overlay[bagName];
  return rows.map((row) => {
    if (!row || typeof row !== "object") return row;
    const record = row as { id?: unknown; slug?: unknown };
    const extra = bag[String(record.id ?? "")] || bag[String(record.slug ?? "")];
    return mergeRow(row, extra);
  });
}
