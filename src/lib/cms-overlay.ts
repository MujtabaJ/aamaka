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
  coupons: OverlayBag;
  genres: OverlayBag;
  reviews: OverlayBag;
  deleted?: Record<string, string[]>;
  sections?: HomepageSection[];
  settings?: Record<string, unknown>;
};

export type EntityBag = keyof Omit<CmsOverlay, "sections" | "settings" | "updatedAt" | "deleted">;

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
  coupons: {},
  genres: {},
  reviews: {},
};

const BLOB_PREFIX = "cms/state/";
const MODEL_TO_BAG: Record<string, EntityBag> = {
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
  coupon: "coupons",
  genre: "genres",
  review: "reviews",
};

const INJECT_BAGS = new Set<EntityBag>([
  "heroes",
  "artists",
  "albums",
  "books",
  "articles",
  "products",
  "categories",
  "songs",
  "announcements",
  "pages",
  "faqs",
  "plans",
  "coupons",
  "genres",
  "reviews",
]);

function bagFor(model: string): EntityBag | null {
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
    coupons: incoming.coupons ?? {},
    genres: incoming.genres ?? {},
    reviews: incoming.reviews ?? {},
    deleted: incoming.deleted,
    sections: incoming.sections,
    settings: incoming.settings,
  };
}

function newest(...candidates: Array<CmsOverlay | null>) {
  return (
    candidates
      .filter((item): item is CmsOverlay => Boolean(item))
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0] ?? { ...EMPTY }
  );
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

function snapshot(fields: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    if (value instanceof Date) {
      out[key] = value.toISOString();
      continue;
    }
    if (typeof value === "bigint") {
      out[key] = Number(value);
      continue;
    }
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      try {
        JSON.stringify(value);
        out[key] = value;
      } catch {
        /* skip circular relation objects */
      }
      continue;
    }
    out[key] = value;
  }
  return out;
}

export function newRecordId() {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export async function rememberEntity(bag: EntityBag, id: string, fields: Record<string, unknown>) {
  if (!id) return;
  const current = await loadCmsOverlay();
  current[bag] = {
    ...current[bag],
    [id]: { ...(current[bag][id] ?? {}), ...snapshot(fields), id },
  };
  if (current.deleted?.[bag]) {
    current.deleted = {
      ...current.deleted,
      [bag]: current.deleted[bag].filter((item) => item !== id),
    };
  }
  await saveCmsOverlay(current);
}

export async function persistEntity(
  bag: EntityBag,
  id: string,
  fields: Record<string, unknown>,
  write: (recordId: string) => Promise<{ id: string } | void>,
) {
  const recordId = id || newRecordId();
  await rememberEntity(bag, recordId, { ...fields, id: recordId });
  try {
    const row = await write(recordId);
    if (row?.id && row.id !== recordId) {
      await rememberEntity(bag, row.id, { ...fields, id: row.id });
      return row.id;
    }
  } catch {
    /* overlay is the durable copy when the temporary database cannot keep the write */
  }
  return recordId;
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

export async function forgetEntity(bag: EntityBag, id: string) {
  if (!id) return;
  const current = await loadCmsOverlay();
  if (current[bag][id]) {
    const next = { ...current[bag] };
    delete next[id];
    current[bag] = next;
  }
  current.deleted = {
    ...current.deleted,
    [bag]: [...new Set([...(current.deleted?.[bag] ?? []), id])],
  };
  await saveCmsOverlay(current);
}

function mergeRow<T>(row: T, extra?: Record<string, unknown> | null): T {
  if (!extra || !row || typeof row !== "object") return row;
  return { ...row, ...extra } as T;
}

function deletedIds(overlay: CmsOverlay, bag: EntityBag) {
  return new Set(overlay.deleted?.[bag] ?? []);
}

function extraFor(overlay: CmsOverlay, bag: EntityBag, row: { id?: unknown; slug?: unknown; code?: unknown }) {
  return (
    overlay[bag][String(row.id ?? "")] ||
    overlay[bag][String(row.slug ?? "")] ||
    overlay[bag][String(row.code ?? "")] ||
    null
  );
}

function attachRelations<T>(row: T, overlay: CmsOverlay): T {
  if (!row || typeof row !== "object") return row;
  const record = { ...(row as Record<string, unknown>) };
  if (typeof record.artistId === "string" && overlay.artists[record.artistId]) {
    record.artist = { ...((record.artist as object) ?? {}), ...overlay.artists[record.artistId] };
  }
  if (typeof record.categoryId === "string" && overlay.categories[record.categoryId]) {
    record.category = { ...((record.category as object) ?? {}), ...overlay.categories[record.categoryId] };
  }
  if (typeof record.genreId === "string" && overlay.genres[record.genreId]) {
    record.genre = { ...((record.genre as object) ?? {}), ...overlay.genres[record.genreId] };
  }
  if (typeof record.albumId === "string" && overlay.albums[record.albumId]) {
    record.album = { ...((record.album as object) ?? {}), ...overlay.albums[record.albumId] };
  }
  if (typeof record.productId === "string" && overlay.products[record.productId]) {
    record.product = { ...((record.product as object) ?? {}), ...overlay.products[record.productId] };
  }
  return record as T;
}

function matchesWhere(row: Record<string, unknown>, where: unknown): boolean {
  if (!where || typeof where !== "object") return true;
  const clauses = where as Record<string, unknown>;
  for (const [key, value] of Object.entries(clauses)) {
    if (key === "AND" && Array.isArray(value)) {
      if (!value.every((part) => matchesWhere(row, part))) return false;
      continue;
    }
    if (key === "OR" && Array.isArray(value)) {
      if (!value.some((part) => matchesWhere(row, part))) return false;
      continue;
    }
    if (key === "NOT") {
      if (matchesWhere(row, value)) return false;
      continue;
    }
    const current = row[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const cond = value as Record<string, unknown>;
      if ("in" in cond && Array.isArray(cond.in) && !cond.in.includes(current)) return false;
      if ("not" in cond && current === cond.not) return false;
      if ("contains" in cond && !String(current ?? "").toLowerCase().includes(String(cond.contains).toLowerCase())) {
        return false;
      }
      if ("equals" in cond && current !== cond.equals) return false;
      continue;
    }
    if (current !== undefined && current !== value) return false;
  }
  return true;
}

export function applyBag<T extends { id?: string; slug?: string }>(rows: T[], bag: OverlayBag): T[] {
  return rows.map((row) => {
    const extra = (row.id && bag[row.id]) || (row.slug && bag[row.slug]) || null;
    return mergeRow(row, extra);
  });
}

export async function hydrateRecord<T>(model: string, row: T, where?: unknown): Promise<T | null> {
  if (row && typeof row === "object") {
    const overlay = await loadCmsOverlay();
    if (model.toLowerCase() === "sitesetting") {
      const setting = row as { key?: string; value?: string };
      if (setting.key === "homepage" && overlay.sections) {
        return { ...row, value: JSON.stringify({ sections: overlay.sections }) };
      }
      if (setting.key === "site" && overlay.settings) {
        let parsed: Record<string, unknown> = {};
        try {
          parsed = JSON.parse(setting.value || "{}") as Record<string, unknown>;
        } catch {
          parsed = {};
        }
        return { ...row, value: JSON.stringify({ ...parsed, ...overlay.settings }) };
      }
      return row;
    }
    const bagName = bagFor(model);
    if (!bagName) return row;
    const record = row as { id?: unknown; slug?: unknown; code?: unknown };
    if (deletedIds(overlay, bagName).has(String(record.id ?? ""))) return null as T;
    return attachRelations(mergeRow(row, extraFor(overlay, bagName, record)), overlay);
  }
  return lookupOverlayRecord<T>(model, where);
}

export async function lookupOverlayRecord<T>(model: string, where?: unknown): Promise<T | null> {
  const bagName = bagFor(model);
  if (!bagName) return null;
  const overlay = await loadCmsOverlay();
  const bag = overlay[bagName];
  const removed = deletedIds(overlay, bagName);
  const clauses = where && typeof where === "object" ? (where as Record<string, unknown>) : {};
  const direct =
    (typeof clauses.id === "string" && bag[clauses.id]) ||
    (typeof clauses.slug === "string" && (bag[clauses.slug] || Object.values(bag).find((item) => item.slug === clauses.slug))) ||
    (typeof clauses.code === "string" && Object.values(bag).find((item) => item.code === clauses.code)) ||
    null;
  if (direct && !removed.has(String(direct.id ?? ""))) {
    return attachRelations(direct as T, overlay);
  }
  const match = Object.values(bag).find(
    (item) => !removed.has(String(item.id ?? "")) && matchesWhere(item, where),
  );
  return match ? attachRelations(match as T, overlay) : null;
}

export async function hydrateRecords<T>(model: string, rows: T[], where?: unknown): Promise<T[]> {
  if (!Array.isArray(rows)) return rows;
  if (model.toLowerCase() === "sitesetting") {
    const next = await Promise.all(rows.map((row) => hydrateRecord(model, row)));
    return next.filter((row) => row != null) as T[];
  }
  const overlay = await loadCmsOverlay();
  const bagName = bagFor(model);
  if (!bagName) return rows;
  const bag = overlay[bagName];
  const removed = deletedIds(overlay, bagName);
  const seen = new Set<string>();
  const merged = rows
    .filter((row) => {
      if (!row || typeof row !== "object") return true;
      const record = row as { id?: unknown };
      const id = String(record.id ?? "");
      if (removed.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map((row) => {
      if (!row || typeof row !== "object") return row;
      const record = row as { id?: unknown; slug?: unknown; code?: unknown };
      return attachRelations(mergeRow(row, extraFor(overlay, bagName, record)), overlay);
    });

  if (!INJECT_BAGS.has(bagName)) return merged;

  for (const extra of Object.values(bag)) {
    const id = String(extra.id ?? "");
    if (!id || seen.has(id) || removed.has(id)) continue;
    if (!matchesWhere(extra, where)) continue;
    merged.push(attachRelations(extra as T, overlay));
    seen.add(id);
  }
  return merged;
}
