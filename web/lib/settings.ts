// Pengaturan situs yang bisa diubah dari /admin: identitas brand, SEO,
// kontak, sosial media, promo, dan moderasi ulasan.

import { gamepassPriceFor, parsePromo, str, TOPUP_TYPES, type Category, type Promo } from "@/lib/catalog";
import { num, rupiah } from "@/lib/utils";

/** Platform siap pakai; "custom" untuk platform lain (label & URL bebas). */
export const SOCIAL_PLATFORMS = {
  instagram: { label: "Instagram", base: "https://www.instagram.com/" },
  tiktok: { label: "TikTok", base: "https://www.tiktok.com/@" },
  discord: { label: "Discord", base: "" },
  x: { label: "X", base: "https://x.com/" },
  youtube: { label: "YouTube", base: "https://www.youtube.com/@" },
  facebook: { label: "Facebook", base: "https://www.facebook.com/" },
  threads: { label: "Threads", base: "https://www.threads.net/@" },
  telegram: { label: "Telegram", base: "https://t.me/" },
  custom: { label: "Lainnya", base: "" },
} as const;

export type SocialPlatform = keyof typeof SOCIAL_PLATFORMS;
export const SOCIAL_KEYS = Object.keys(SOCIAL_PLATFORMS) as SocialPlatform[];

/** Satu akun sosial. Urutan di array = urutan di footer. */
export type Social = { id: string; platform: SocialPlatform; label: string; handle: string; url: string; visible: boolean };

export type Settings = {
  brand: string;
  tagline: string;
  description: string;
  /** Domain publik, mis. https://joycomart.vercel.app */
  url: string;
  /** Handle utama untuk kartu share (twitter:site), mis. @joycomart */
  handle: string;
  keywords: string[];
  whatsapp: string;
  hours: string;
  payments: string;
  socials: Social[];
  promo: Promo;
  /** Template pesan WhatsApp. Lihat MESSAGE_TOKENS untuk placeholder. */
  messages: Messages;
  /** true = ulasan baru menunggu persetujuan admin sebelum tampil. */
  moderateReviews: boolean;
};

export type Messages = {
  /** Tombol beli di katalog, kalkulator, dan cek harga beranda. */
  order: string;
  /** Tombol chat umum: header, hero, footer, tombol WhatsApp melayang. */
  general: string;
};

/** Placeholder yang bisa dipakai di template pesan. */
export const MESSAGE_TOKENS = [
  { token: "{brand}", desc: "Nama brand", example: "Joyco" },
  { token: "{jenis}", desc: "Jenis top up", example: "Digital Card" },
  { token: "{kategori}", desc: "Nama kategori", example: "Roblox Digital Card" },
  { token: "{item}", desc: "Varian yang dipilih", example: "840 Robux" },
  { token: "{jumlah}", desc: "Jumlah Robux (angka)", example: "840" },
  { token: "{harga}", desc: "Harga akhir", example: "Rp 120.000" },
  { token: "{catatan}", desc: "Baris tambahan otomatis (mis. link gamepass)", example: "" },
] as const;

export const DEFAULT_MESSAGES: Messages = {
  order: "Halo {brand}, saya ingin membeli Robux via {jenis} varian {item} seharga {harga}.\nUsername: \n{catatan}",
  general: "Halo {brand}, saya ingin order Robux.",
};

export const DEFAULT_SETTINGS: Settings = {
  brand: "Joyco",
  tagline: "Build underground. Trusted everywhere.",
  description:
    "Build underground. Trusted everywhere. Top up Robux via username, gamepass, komunitas, atau Roblox Digital Card, dengan nota digital di setiap order.",
  url: "https://joycomart.vercel.app",
  handle: "@joycomart",
  keywords: ["Joyco", "joycomart", "top up Robux", "beli Robux", "Robux murah", "Robux via gamepass", "Robux via komunitas", "Roblox digital card"],
  whatsapp: process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890",
  hours: "09.00–23.00 WIB",
  payments: "QRIS · Transfer · E-wallet",
  socials: [
    { id: "instagram", platform: "instagram", label: "Instagram", handle: "@joycomart", url: "", visible: true },
    { id: "tiktok", platform: "tiktok", label: "TikTok", handle: "@joycomart", url: "", visible: true },
    { id: "discord", platform: "discord", label: "Discord", handle: "joycomart", url: "", visible: true },
  ],
  promo: {
    enabled: false,
    label: "",
    message: "",
    percent: 0,
    categoryIds: [],
    endsAt: "",
  },
  messages: DEFAULT_MESSAGES,
  moderateReviews: false,
};

const httpUrl = (v: unknown) => {
  const s = str(v, 300);
  return /^https?:\/\/[^\s]+$/.test(s) ? s.replace(/\/$/, "") : "";
};

export function parseSettings(input: unknown): Settings | null {
  if (!input || typeof input !== "object") return null;
  const r = input as Record<string, unknown>;
  const d = DEFAULT_SETTINGS;
  const handle = str(r.handle, 40).replace(/^@?/, "@");

  return {
    brand: str(r.brand, 40) || d.brand,
    tagline: str(r.tagline, 80) || d.tagline,
    description: str(r.description, 300) || d.description,
    url: httpUrl(r.url) || d.url,
    handle: handle === "@" ? d.handle : handle,
    keywords: Array.isArray(r.keywords) ? r.keywords.map((k) => str(k, 40)).filter(Boolean).slice(0, 20) : d.keywords,
    whatsapp: str(r.whatsapp, 20).replace(/\D/g, "") || d.whatsapp,
    hours: str(r.hours, 40),
    payments: str(r.payments, 80),
    socials: Array.isArray(r.socials)
      ? r.socials
          .map((x, i) => {
            const o = (x ?? {}) as Record<string, unknown>;
            const platform = (str(o.platform) in SOCIAL_PLATFORMS ? str(o.platform) : "custom") as SocialPlatform;
            return {
              id: str(o.id, 40) || `${platform}-${i}`,
              platform,
              label: str(o.label, 30) || SOCIAL_PLATFORMS[platform].label,
              handle: str(o.handle, 60),
              url: httpUrl(o.url),
              visible: o.visible !== false,
            };
          })
          .filter((x) => x.handle || x.url)
          .slice(0, 12)
      : d.socials,
    promo: parsePromo(r.promo),
    messages: parseMessages(r.messages),
    moderateReviews: r.moderateReviews === true,
  };
}

/** URL profil: url eksplisit, atau dirakit dari handle bila platformnya punya pola. */
export function socialHref(x: Social) {
  if (x.url) return x.url;
  const base = SOCIAL_PLATFORMS[x.platform].base;
  return base && x.handle ? base + x.handle.replace(/^@/, "") : "";
}

/**
 * Link Discord untuk tombol di navigasi: akun sosial berplatform Discord yang
 * punya URL (mis. https://discord.gg/xxxx). Kosong = tombol disembunyikan.
 */
export const discordHref = (s: Pick<Settings, "socials">) => {
  const d = s.socials.find((x) => x.platform === "discord" && socialHref(x));
  return d ? socialHref(d) : "";
};

/** Akun yang ditampilkan di footer & dipakai SEO. */
export const visibleSocials = (s: Settings) => s.socials.filter((x) => x.visible && (x.handle || x.url));

export function waLink(whatsapp: string, text: string) {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
}

/** Template kosong/tidak valid jatuh ke default, supaya tombol tidak pernah mengirim pesan kosong. */
function parseMessages(input: unknown): Messages {
  const r = (input ?? {}) as Record<string, unknown>;
  const clean = (v: unknown, fallback: string) => {
    const s = typeof v === "string" ? v.replace(/\r\n?/g, "\n").slice(0, 600).trim() : "";
    return s || fallback;
  };
  return { order: clean(r.order, DEFAULT_MESSAGES.order), general: clean(r.general, DEFAULT_MESSAGES.general) };
}

/**
 * Isi placeholder {nama}. Placeholder yang tidak dikenal dibiarkan apa adanya
 * (supaya salah ketik terlihat di pratinjau admin). Spasi ganda akibat
 * placeholder kosong dirapikan, dan baris kosong di akhir dibuang
 * (mis. {catatan} untuk jenis selain gamepass).
 */
export function fillTemplate(template: string, values: Record<string, string>) {
  return template
    .replace(/\{(\w+)\}/g, (m, key: string) => (key in values ? values[key] : m))
    .split("\n")
    .map((line) => line.replace(/ {2,}/g, " "))
    .join("\n")
    .replace(/\s+$/, "");
}

type MessageSettings = Pick<Settings, "brand" | "messages">;

/** Pesan umum (chat admin tanpa produk tertentu). */
export const generalMessage = (s: MessageSettings) => fillTemplate(s.messages.general, { brand: s.brand });

/**
 * Pesan order untuk satu produk: dipakai SEMUA tombol beli (baris katalog,
 * kalkulator, cek harga beranda) supaya formatnya selalu sama.
 */
export function orderMessage(s: MessageSettings, category: Category, what: { robux: number | null; label?: string }, price: number) {
  const item = what.robux !== null ? `${num(what.robux)} Robux` : (what.label ?? category.name);
  const catatan =
    category.type === "gamepass" && what.robux ? `Link gamepass (set harga gamepass ${num(gamepassPriceFor(what.robux))} Robux): ` : "";
  return fillTemplate(s.messages.order, {
    brand: s.brand,
    jenis: TOPUP_TYPES[category.type].short,
    kategori: category.name,
    item,
    jumlah: what.robux !== null ? num(what.robux) : "",
    harga: rupiah(price),
    catatan,
  });
}

type ContactSettings = MessageSettings & Pick<Settings, "whatsapp">;

/** Link WhatsApp untuk tombol beli satu produk. */
export const orderLink = (s: ContactSettings, category: Category, what: { robux: number | null; label?: string }, price: number) =>
  waLink(s.whatsapp, orderMessage(s, category, what, price));

/** Link WhatsApp saat stok habis: minta dikabari ketika kategori ini ready lagi. */
export const notifyLink = (s: Pick<Settings, "whatsapp" | "brand">, category: Category) =>
  waLink(s.whatsapp, `Halo ${s.brand}, saya ingin dikabari saat ${category.name} ready kembali.`);

/** Link WhatsApp untuk tombol chat admin umum. */
export const generalLink = (s: ContactSettings) => waLink(s.whatsapp, generalMessage(s));

/** Bagian publik dari settings yang dikirim ke komponen client. */
export type PublicSettings = Omit<Settings, "moderateReviews">;
export const toPublicSettings = ({ moderateReviews: _m, ...rest }: Settings): PublicSettings => rest;
