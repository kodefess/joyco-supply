import "server-only";

import { hasRedis, redis } from "@/lib/redis";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";

import { IN_STOCK, parseCatalog, type Catalog } from "@/lib/catalog";
import { SEED_CATALOG } from "@/lib/catalog-seed";
import { deleteImages } from "@/lib/images";
import { normalizeReview, sortNewest, type Review } from "@/lib/reviews";
import { DEFAULT_SETTINGS, parseSettings, type Settings } from "@/lib/settings";

const KEYS = {
  catalog: "joycomart:catalog",
  settings: "joycomart:settings",
  reviews: "joycomart:reviews", // hash: id → Review
  rate: (id: string) => `joycomart:rl:${id}`,
};

export const TAGS = { catalog: "catalog", settings: "settings", reviews: "reviews" } as const;
const MAX_REVIEWS = 2000;


const db = redis;

// Tanpa Redis (dev lokal), data disimpan di memori proses saja.
type Memory = { catalog?: Catalog; settings?: Settings; reviews: Map<string, Review>; rate: Map<string, { n: number; until: number }> };
const g = globalThis as unknown as { __joyco?: Memory };
const mem: Memory = (g.__joyco ??= { reviews: new Map(), rate: new Map() });

export const storageMode = () => (hasRedis() ? "redis" : "memory");

/** Bersihkan cache data + halaman publik setelah ada perubahan. */
function invalidate(tag: string) {
  revalidateTag(tag, { expire: 0 });
  revalidatePath("/", "layout");
}

/* ------------------------------------------------------------------ */
/* Katalog                                                              */
/* ------------------------------------------------------------------ */

async function readCatalog(): Promise<Catalog> {
  if (!hasRedis()) return mem.catalog ?? SEED_CATALOG;
  try {
    const stored = await db().get<Catalog>(KEYS.catalog);
    const parsed = stored ? parseCatalog(stored) : null;
    return parsed ? { ...parsed, updatedAt: stored!.updatedAt ?? parsed.updatedAt } : SEED_CATALOG;
  } catch (error) {
    console.error("Gagal membaca katalog", error);
    return SEED_CATALOG;
  }
}

/**
 * Data yang tersimpan sebelum ada fitur stok (memori proses, cache data
 * lama) belum punya `stock`. Lengkapi di sini supaya komponen tidak pernah
 * menerima kategori tanpa status stok.
 */
const withStock = (catalog: Catalog): Catalog => ({
  ...catalog,
  categories: catalog.categories.map((c) => (c.stock ? c : { ...c, stock: IN_STOCK })),
});

const cachedCatalog = unstable_cache(readCatalog, [KEYS.catalog], { tags: [TAGS.catalog], revalidate: 300 });

/** Katalog untuk halaman publik — di-cache, dibuang saat admin menyimpan. */
export const getCatalog = async () => withStock(await cachedCatalog());
export const getCatalogFresh = async () => withStock(await readCatalog());

export async function getPublicCatalog() {
  const catalog = await getCatalog();
  return { ...catalog, categories: catalog.categories.filter((c) => c.visible) };
}

export async function saveCatalog(catalog: Catalog) {
  if (hasRedis()) await db().set(KEYS.catalog, catalog);
  else mem.catalog = catalog;
  invalidate(TAGS.catalog);
}

/* ------------------------------------------------------------------ */
/* Pengaturan                                                           */
/* ------------------------------------------------------------------ */

async function readSettings(): Promise<Settings> {
  if (!hasRedis()) return mem.settings ?? DEFAULT_SETTINGS;
  try {
    const stored = await db().get<Settings>(KEYS.settings);
    return (stored && parseSettings(stored)) || DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Gagal membaca pengaturan", error);
    return DEFAULT_SETTINGS;
  }
}

export const getSettings = unstable_cache(readSettings, [KEYS.settings], { tags: [TAGS.settings], revalidate: 300 });
export const getSettingsFresh = readSettings;

export async function saveSettings(settings: Settings) {
  if (hasRedis()) await db().set(KEYS.settings, settings);
  else mem.settings = settings;
  invalidate(TAGS.settings);
}

/* ------------------------------------------------------------------ */
/* Ulasan                                                               */
/* ------------------------------------------------------------------ */

async function readReviews(): Promise<Review[]> {
  if (!hasRedis()) return [...mem.reviews.values()].map(normalizeReview).sort(sortNewest);
  try {
    const all = await db().hgetall<Record<string, Review>>(KEYS.reviews);
    return Object.values(all ?? {}).map(normalizeReview).sort(sortNewest);
  } catch (error) {
    console.error("Gagal membaca ulasan", error);
    return [];
  }
}

export const getAllReviews = readReviews;

/** Ulasan yang sudah tampil, untuk halaman publik. */
export const getPublishedReviews = unstable_cache(
  async () => (await readReviews()).filter((r) => r.approved),
  [KEYS.reviews],
  { tags: [TAGS.reviews], revalidate: 300 },
);

export async function addReview(review: Review) {
  if (hasRedis()) {
    const r = db();
    if ((await r.hlen(KEYS.reviews)) >= MAX_REVIEWS) throw new Error("Penyimpanan ulasan penuh.");
    await r.hset(KEYS.reviews, { [review.id]: review });
  } else {
    mem.reviews.set(review.id, review);
  }
  invalidate(TAGS.reviews);
}

export async function updateReview(id: string, patch: Partial<Pick<Review, "approved">>) {
  if (hasRedis()) {
    const current = await db().hget<Review>(KEYS.reviews, id);
    if (!current) return false;
    await db().hset(KEYS.reviews, { [id]: { ...current, ...patch } });
  } else {
    const current = mem.reviews.get(id);
    if (!current) return false;
    mem.reviews.set(id, { ...current, ...patch });
  }
  invalidate(TAGS.reviews);
  return true;
}

export async function deleteReview(id: string) {
  const current = hasRedis() ? await db().hget<Review>(KEYS.reviews, id) : mem.reviews.get(id);
  if (hasRedis()) await db().hdel(KEYS.reviews, id);
  else mem.reviews.delete(id);
  if (current) await deleteImages([current.avatar, current.photo]);
  invalidate(TAGS.reviews);
}

/* ------------------------------------------------------------------ */
/* Rate limit sederhana per IP                                          */
/* ------------------------------------------------------------------ */

/** true bila masih boleh; jendela tetap `windowSec` detik. */
export async function rateLimit(id: string, limit: number, windowSec: number) {
  if (hasRedis()) {
    const key = KEYS.rate(id);
    const n = await db().incr(key);
    if (n === 1) await db().expire(key, windowSec);
    return n <= limit;
  }
  const now = Date.now();
  const entry = mem.rate.get(id);
  if (!entry || entry.until < now) {
    mem.rate.set(id, { n: 1, until: now + windowSec * 1000 });
    return true;
  }
  entry.n += 1;
  return entry.n <= limit;
}
