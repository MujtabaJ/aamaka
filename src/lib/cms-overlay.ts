import fs from "fs/promises";
import path from "path";
import type { HomepageSection } from "@/lib/homepage";

export type OverlayBag = Record<string, Record<string, unknown>>;

export type CmsOverlay = {
  heroes: OverlayBag;
  artists: OverlayBag;
  albums: OverlayBag;
  books: OverlayBag;
  articles: OverlayBag;
  products: OverlayBag;
  categories: OverlayBag;
  songs: OverlayBag;
  users: OverlayBag;
  sections?: HomepageSection[];
};

const EMPTY: CmsOverlay = {
  heroes: {},
  artists: {},
  albums: {},
  books: {},
  articles: {},
  products: {},
  categories: {},
  songs: {},
  users: {},
};

const BLOB_PATH = "cms/overlay.json";
const MODEL_TO_BAG: Record<string, keyof CmsOverlay> = {
  HomepageHero: "heroes",
  Artist: "artists",
  Album: "albums",
  Book: "books",
  Article: "articles",
  Product: "products",
  ProductCategory: "categories",
  Song: "songs",
  User: "users",
};

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
    heroes: incoming.heroes ?? {},
    artists: incoming.artists ?? {},
    albums: incoming.albums ?? {},
    books: incoming.books ?? {},
    articles: incoming.articles ?? {},
    products: incoming.products ?? {},
    categories: incoming.categories ?? {},
    songs: incoming.songs ?? {},
    users: incoming.users ?? {},
    sections: incoming.sections,
  };
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
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 10 });
    const item = blobs.find((blob) => blob.pathname === BLOB_PATH) ?? blobs[0];
    if (!item) return null;
    const response = await fetch(item.url, { cache: "no-store" });
    if (!response.ok) return null;
    return asOverlay(await response.json());
  } catch {
    return null;
  }
}

async function writeBlob(data: CmsOverlay) {
  if (!canUseBlob()) return;
  const { put } = await import("@vercel/blob");
  await put(BLOB_PATH, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export function invalidateCmsOverlay() {
  memory = null;
}

export async function loadCmsOverlay(): Promise<CmsOverlay> {
  if (memory && Date.now() - memory.at < 2000) return memory.data;
  const remote = await readBlob();
  const local = remote ?? (await readLocal()) ?? { ...EMPTY };
  memory = { data: local, at: Date.now() };
  return local;
}

export async function saveCmsOverlay(data: CmsOverlay) {
  memory = { data, at: Date.now() };
  await writeLocal(data);
  try {
    await writeBlob(data);
  } catch {
    /* local copy still keeps this instance consistent */
  }
}

export async function rememberEntity(bag: keyof Omit<CmsOverlay, "sections">, id: string, fields: Record<string, unknown>) {
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

export async function forgetEntity(bag: keyof Omit<CmsOverlay, "sections">, id: string) {
  const current = await loadCmsOverlay();
  if (!current[bag][id]) return;
  const next = { ...current[bag] };
  delete next[id];
  current[bag] = next;
  await saveCmsOverlay(current);
}

export async function hydrateRecord<T>(model: string, row: T): Promise<T> {
  if (!row || typeof row !== "object") return row;
  const overlay = await loadCmsOverlay();
  if (model === "SiteSetting") {
    const setting = row as { key?: string; value?: string };
    if (setting.key === "homepage" && overlay.sections) {
      return { ...row, value: JSON.stringify({ sections: overlay.sections }) };
    }
    return row;
  }
  const bagName = MODEL_TO_BAG[model];
  if (!bagName || bagName === "sections") return row;
  const id = "id" in row ? String((row as { id?: unknown }).id ?? "") : "";
  const extra = id ? overlay[bagName][id] : null;
  return extra ? { ...row, ...extra } : row;
}

export async function hydrateRecords<T>(model: string, rows: T[]): Promise<T[]> {
  if (!Array.isArray(rows) || rows.length === 0) return rows;
  const overlay = await loadCmsOverlay();
  const bagName = MODEL_TO_BAG[model];
  if (!bagName || bagName === "sections") return rows;
  const bag = overlay[bagName];
  return rows.map((row) => {
    if (!row || typeof row !== "object" || !("id" in row)) return row;
    const extra = bag[String((row as { id: unknown }).id)];
    return extra ? ({ ...row, ...extra } as T) : row;
  });
}
