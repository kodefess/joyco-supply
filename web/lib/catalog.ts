// Model katalog harga + promo. Dipakai di server (store, API) dan client
// (admin, kalkulator), jadi file ini tidak boleh import apa pun yang server-only.

import { num, rupiah } from "@/lib/utils";

export const TOPUP_TYPES = {
  username: { label: "Via Username", short: "Username", code: "01" },
  gamepass: { label: "Via Gamepass", short: "Gamepass", code: "02" },
  komunitas: { label: "Via Komunitas", short: "Komunitas", code: "03", alias: "Payout" },
  card: { label: "Digital Card", short: "Digital Card", code: "04" },
} as const;

export type TopupType = keyof typeof TOPUP_TYPES;
export const TOPUP_TYPE_KEYS = Object.keys(TOPUP_TYPES) as TopupType[];

export type CatalogItem = {
  id: string;
  /** Jumlah Robux. null untuk item non-Robux, mis. Roblox Plus. */
  robux: number | null;
  /** Nama item bila bukan Robux. */
  label: string;
  price: number;
  /** Harga promo khusus item ini. Selama diisi, harga normal tampil dicoret. */
  promoPrice: number | null;
};

/**
 * Jumlah bebas yang diketik pembeli. Harga = jumlah × (price / per).
 * price null = ikut tarif paket terdekat di bawah jumlah itu.
 */
export type CustomPricing = {
  enabled: boolean;
  per: number;
  price: number | null;
  min: number;
  max: number;
};

/** Status stok per kategori, diatur dari Admin → Katalog. */
export type Stock = {
  /** true = stok habis: tombol beli diganti "Kabari saya saat ready". */
  soldOut: boolean;
  /** Perkiraan ready lagi, format YYYY-MM-DD. Kosong = belum pasti. */
  restockAt: string;
  /** Catatan singkat untuk pembeli, mis. "Menunggu payout grup". */
  note: string;
};

export const IN_STOCK: Stock = { soldOut: false, restockAt: "", note: "" };

export type Category = {
  id: string;
  name: string;
  type: TopupType;
  summary: string;
  eta: string;
  notes: string[];
  link: { label: string; url: string } | null;
  visible: boolean;
  stock: Stock;
  items: CatalogItem[];
  custom: CustomPricing;
};

export type Catalog = {
  categories: Category[];
  updatedAt: string;
};

export type Promo = {
  enabled: boolean;
  /** Teks pendek di badge, mis. "11.11". */
  label: string;
  /** Kalimat di bar promo. */
  message: string;
  /** Diskon persen untuk kategori terpilih (0 = tanpa diskon persen). */
  percent: number;
  /** Kosong = semua kategori. */
  categoryIds: string[];
  /** ISO datetime; kosong = tanpa batas waktu. */
  endsAt: string;
};

export const uid = () => Math.random().toString(36).slice(2, 10);

/* ------------------------------------------------------------------ */
/* Harga                                                                */
/* ------------------------------------------------------------------ */

/** Potongan Roblox untuk penjualan gamepass. */
export const GAMEPASS_CUT = 0.3;
export const gamepassPriceFor = (robux: number) => Math.ceil(robux / (1 - GAMEPASS_CUT));

const roundUp100 = (n: number) => Math.ceil(n / 100) * 100;

export function promoActive(promo: Promo | null | undefined, now = Date.now()) {
  if (!promo?.enabled) return false;
  return !promo.endsAt || Date.parse(promo.endsAt) > now;
}

/** Diskon persen yang berlaku untuk kategori ini (0 bila tidak ada). */
export function promoPercentFor(promo: Promo | null | undefined, categoryId: string) {
  if (!promoActive(promo) || !promo!.percent) return 0;
  return promo!.categoryIds.length === 0 || promo!.categoryIds.includes(categoryId) ? promo!.percent : 0;
}

const discount = (price: number, percent: number) => (percent > 0 ? roundUp100(price * (1 - percent / 100)) : price);

export type Priced = { price: number; original: number | null; percent: number };

/** Harga akhir satu item paket, termasuk promo item atau promo persen. */
export function priceItem(item: CatalogItem, category: Category, promo?: Promo | null): Priced {
  if (item.promoPrice !== null && item.promoPrice > 0 && item.promoPrice < item.price) {
    return { price: item.promoPrice, original: item.price, percent: Math.round((1 - item.promoPrice / item.price) * 100) };
  }
  const pct = promoPercentFor(promo, category.id);
  const price = discount(item.price, pct);
  return { price, original: price < item.price ? item.price : null, percent: pct };
}

/** Tarif Rp per Robux untuk jumlah custom. */
export function customRate(category: Category, robux: number) {
  const c = category.custom;
  if (c.price !== null && c.price > 0 && c.per > 0) return c.price / c.per;
  // Ikut paket: pakai tarif paket terbesar yang jumlahnya ≤ robux.
  const packs = category.items.filter((i) => i.robux).sort((a, b) => a.robux! - b.robux!);
  if (!packs.length) return null;
  const base = [...packs].reverse().find((p) => p.robux! <= robux) ?? packs[0];
  return base.price / base.robux!;
}

export type Quote = Priced & { robux: number; basis: "paket" | "custom"; rate: number };

/**
 * Harga untuk sejumlah Robux: harga paket bila jumlahnya persis ada,
 * selain itu dihitung custom (dibulatkan ke atas per Rp 100).
 */
export function quote(category: Category, robux: number, promo?: Promo | null): Quote | null {
  if (!Number.isFinite(robux) || robux <= 0) return null;
  const pack = category.items.find((i) => i.robux === robux);
  if (pack) {
    const p = priceItem(pack, category, promo);
    return { ...p, robux, basis: "paket", rate: p.price / robux };
  }
  const c = category.custom;
  if (!c.enabled || robux < c.min || robux > c.max) return null;
  const rate = customRate(category, robux);
  if (rate === null) return null;
  const base = roundUp100(robux * rate);
  const pct = promoPercentFor(promo, category.id);
  const price = discount(base, pct);
  return { price, original: price < base ? base : null, percent: pct, robux, basis: "custom", rate: price / robux };
}

/** Harga termurah di kategori, untuk label "mulai dari". */
export function startingPrice(category: Category, promo?: Promo | null) {
  const prices = category.items.map((i) => priceItem(i, category, promo).price).filter((p) => p > 0);
  if (prices.length) return Math.min(...prices);
  const c = category.custom;
  if (c.enabled && c.price) return quote(category, c.min, promo)?.price ?? null;
  return null;
}

/** Item dengan Rp/Robux terendah — ditandai di katalog. */
export function cheapestPerRobux(category: Category, promo?: Promo | null) {
  let best: CatalogItem | null = null;
  let bestRate = Infinity;
  for (const item of category.items) {
    if (!item.robux) continue;
    const r = priceItem(item, category, promo).price / item.robux;
    if (r < bestRate) {
      best = item;
      bestRate = r;
    }
  }
  return category.items.length > 2 ? best : null;
}

export const hasRobuxPricing = (c: Category) => c.custom.enabled || c.items.some((i) => i.robux);

// Pesan order WhatsApp ada di lib/settings.ts (orderMessage) karena memakai
// template yang bisa diubah admin.

/* ------------------------------------------------------------------ */
/* Teks daftar harga ala WhatsApp: impor & ekspor                       */
/* ------------------------------------------------------------------ */

/**
 * Baca baris seperti "✧ 80 ⏣ — Rp17.000", "per 100 — Rp10.000" atau
 * "✧ ROBLOX PLUS — Rp50.000". Baris lain (judul, garis, catatan) dilewati.
 */
export function parsePriceList(text: string): CatalogItem[] {
  const items: CatalogItem[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/[✧⏣•*\-–—]+/g, " ").replace(/\s+/g, " ").trim();
    const m = line.match(/^(.*?)\s*(?:=|:)?\s*Rp\.?\s*([\d.,]+)\s*(?:k|rb)?$/i);
    if (!m) continue;
    const head = m[1].replace(/\bper\b/i, "").trim();
    let price = Number(m[2].replace(/[.,]/g, ""));
    if (/(k|rb)\s*$/i.test(raw.trim())) price *= 1000;
    if (!price) continue;
    const amount = head.match(/^(\d[\d.]*)\s*(?:robux|rbx|r\$)?$/i);
    items.push({
      id: uid(),
      robux: amount ? Number(amount[1].replace(/\./g, "")) : null,
      label: amount ? "" : titleCase(head),
      price,
      promoPrice: null,
    });
  }
  return items;
}

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/** Ekspor katalog ke format teks WhatsApp yang biasa dipakai admin. */
export function toPriceListText(catalog: Catalog, promo?: Promo | null) {
  const blocks = catalog.categories
    .filter((c) => c.visible && (c.items.length || (c.custom.enabled && c.custom.price)))
    .map((c) => {
      const title = `⏣ ${c.name.toUpperCase()} ⏣`;
      const rule = "━".repeat(Math.max(16, title.length + 4));
      const rows = c.items.map((i) => {
        const what = i.robux !== null ? `${i.robux} ⏣` : i.label.toUpperCase();
        const p = priceItem(i, c, promo);
        return `✧ ${what} — Rp${num(p.price)}${p.original ? ` (normal Rp${num(p.original)})` : ""}`;
      });
      if (c.custom.enabled && c.custom.price) rows.push(`✧ per ${c.custom.per} ⏣ — Rp${num(c.custom.price)}`);
      const notes = c.notes.length ? ["", "Catatan:", ...c.notes.map((n) => `* ${n}`)] : [];
      const link = c.link ? [`${c.link.label}: ${c.link.url}`] : [];
      return [rule, title, rule, ...rows, ...notes, ...link].join("\n");
    });
  return blocks.join("\n\n");
}

/* ------------------------------------------------------------------ */
/* Validasi — semua input admin lewat sini sebelum disimpan             */
/* ------------------------------------------------------------------ */

export const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
export const money = (v: unknown) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 && n <= 1_000_000_000 ? n : 0;
};
const moneyOrNull = (v: unknown) => (v === null || v === undefined || v === "" ? null : money(v) || null);

function parseCustom(raw: unknown, legacyRate: CatalogItem | null): CustomPricing {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const min = Math.max(1, money(r.min) || 100);
  return {
    enabled: legacyRate ? true : r.enabled === true,
    per: Math.max(1, money(r.per) || legacyRate?.robux || 100),
    price: legacyRate ? legacyRate.price : moneyOrNull(r.price),
    min,
    max: Math.max(min, money(r.max) || 10_000),
  };
}

export function parseCatalog(input: unknown): Catalog | null {
  if (!input || typeof input !== "object") return null;
  const raw = (input as { categories?: unknown }).categories;
  if (!Array.isArray(raw) || raw.length > 40) return null;

  const categories: Category[] = [];
  for (const c of raw) {
    if (!c || typeof c !== "object") return null;
    const r = c as Record<string, unknown>;
    const type = str(r.type) as TopupType;
    if (!(type in TOPUP_TYPES)) return null;
    const name = str(r.name, 80);
    if (!name) return null;
    if (!Array.isArray(r.items) || r.items.length > 100) return null;

    const link = r.link && typeof r.link === "object" ? (r.link as Record<string, unknown>) : null;
    const url = link ? str(link.url, 300) : "";
    let items: CatalogItem[] = r.items.map((it) => {
      const i = (it ?? {}) as Record<string, unknown>;
      const robux = i.robux === null || i.robux === "" || i.robux === undefined ? null : money(i.robux);
      return { id: str(i.id, 40) || uid(), robux, label: str(i.label, 60), price: money(i.price), promoPrice: moneyOrNull(i.promoPrice) };
    });
    // Format lama: pricing "rate" menyimpan tarif di item pertama.
    const legacyRate = r.pricing === "rate" ? (items[0] ?? null) : null;
    if (legacyRate) items = [];

    categories.push({
      id: str(r.id, 40) || uid(),
      name,
      type,
      summary: str(r.summary, 400),
      eta: str(r.eta, 40),
      notes: Array.isArray(r.notes) ? r.notes.map((n) => str(n, 300)).filter(Boolean).slice(0, 10) : [],
      link: /^https?:\/\//.test(url) ? { label: str(link?.label, 60) || "Link", url } : null,
      visible: r.visible !== false,
      stock: parseStock(r.stock),
      items,
      custom: parseCustom(r.custom, legacyRate),
    });
  }
  return { categories, updatedAt: new Date().toISOString() };
}

/** Data lama tanpa `stock` dianggap tersedia. Tanggal harus YYYY-MM-DD yang valid. */
export function parseStock(input: unknown): Stock {
  const r = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const date = str(r.restockAt, 10);
  return {
    soldOut: r.soldOut === true,
    restockAt: /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) ? date : "",
    note: str(r.note, 120),
  };
}

const restockFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" });
const restockFmtYear = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/**
 * Teks perkiraan ready untuk pembeli: "Ready lagi 30 Nov", "Ready lagi besok",
 * atau "Segera ready" bila tanggal kosong / sudah lewat (admin belum membuka stok).
 */
export function restockLabel(stock: Stock, now = new Date()) {
  if (!stock.restockAt) return "Segera ready";
  const target = Date.parse(`${stock.restockAt}T00:00:00Z`);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((target - today) / 86_400_000);
  if (days < 0) return "Segera ready";
  if (days === 0) return "Ready hari ini";
  if (days === 1) return "Ready lagi besok";
  const sameYear = new Date(target).getUTCFullYear() === now.getFullYear();
  return `Ready lagi ${(sameYear ? restockFmt : restockFmtYear).format(target)}`;
}

export function parsePromo(input: unknown): Promo {
  const r = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const endsAt = str(r.endsAt, 40);
  return {
    enabled: r.enabled === true,
    label: str(r.label, 24),
    message: str(r.message, 160),
    percent: Math.min(90, Math.max(0, Math.round(Number(r.percent) || 0))),
    categoryIds: Array.isArray(r.categoryIds) ? r.categoryIds.map((x) => str(x, 40)).filter(Boolean).slice(0, 40) : [],
    endsAt: endsAt && !Number.isNaN(Date.parse(endsAt)) ? new Date(endsAt).toISOString() : "",
  };
}

/** Empat jumlah cepat untuk tombol preset: paket terdekat dari 500/1rb/2rb/5rb. */
export function presetAmounts(category: Category) {
  const targets = [500, 1_000, 2_000, 5_000];
  const packs = category.items.filter((i) => i.robux).map((i) => i.robux!);
  if (!packs.length) return targets.filter((t) => t >= category.custom.min && t <= category.custom.max);
  const nearest = (t: number) => packs.reduce((a, b) => (Math.abs(b - t) < Math.abs(a - t) ? b : a));
  return [...new Set(targets.map(nearest))];
}

/** Alasan jumlah tidak bisa dihitung, untuk pesan di kalkulator. */
export function quoteProblem(category: Category, robux: number) {
  if (!robux) return "Masukkan jumlah Robux.";
  const c = category.custom;
  if (!c.enabled) return "Jumlah ini tidak tersedia. Pilih salah satu paket.";
  if (robux < c.min) return `Minimal ${num(c.min)} Robux.`;
  if (robux > c.max) return `Maksimal ${num(c.max)} Robux. Untuk lebih, chat admin.`;
  return "Jumlah ini belum bisa dihitung.";
}
