import "server-only";

import { uid } from "@/lib/catalog";
import { hasRedis, redis } from "@/lib/redis";

// Gambar ulasan (avatar & screenshot) disimpan terpisah dari data ulasan,
// supaya daftar ulasan tetap ringan. Disajikan lewat /api/img/[id] dengan
// cache immutable, jadi tiap gambar cukup dibaca sekali dari Redis.

export type ImageKind = "avatar" | "photo";

/** Batas ukuran setelah di-resize di browser. */
const MAX_BYTES: Record<ImageKind, number> = { avatar: 80_000, photo: 500_000 };
const TYPES = ["image/webp", "image/jpeg", "image/png"] as const;
type ImageType = (typeof TYPES)[number];
type Stored = { type: ImageType; data: string };

const key = (id: string) => `joycomart:img:${id}`;
const db = redis;
const g = globalThis as unknown as { __joycoImages?: Map<string, Stored> };
const mem = (g.__joycoImages ??= new Map());

/** Cocokkan isi file dengan tipe yang diklaim (bukan hanya percaya header). */
function sniff(bytes: Buffer): ImageType | null {
  if (bytes.length > 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length > 8 && bytes.readUInt32BE(0) === 0x89504e47) return "image/png";
  return null;
}

export const isImageId = (id: unknown): id is string => typeof id === "string" && /^(avatar|photo)_[a-z0-9]{8,24}$/.test(id);

/** Simpan data URL; mengembalikan id gambar, atau melempar error dengan pesan yang bisa ditampilkan. */
export async function saveImage(dataUrl: unknown, kind: ImageKind): Promise<string> {
  const m = typeof dataUrl === "string" ? dataUrl.match(/^data:(image\/(?:webp|jpeg|png));base64,([A-Za-z0-9+/=]+)$/) : null;
  if (!m) throw new Error("Format gambar tidak didukung.");
  const bytes = Buffer.from(m[2], "base64");
  if (bytes.length > MAX_BYTES[kind]) throw new Error("Ukuran gambar terlalu besar.");
  const type = sniff(bytes);
  if (!type) throw new Error("File bukan gambar yang valid.");

  const id = `${kind}_${Date.now().toString(36)}${uid()}`;
  const value: Stored = { type, data: m[2] };
  if (hasRedis()) await db().set(key(id), value);
  else mem.set(id, value);
  return id;
}

export async function getImage(id: string): Promise<{ type: ImageType; bytes: Buffer } | null> {
  if (!isImageId(id)) return null;
  const v = hasRedis() ? await db().get<Stored>(key(id)) : mem.get(id);
  if (!v || !TYPES.includes(v.type)) return null;
  return { type: v.type, bytes: Buffer.from(v.data, "base64") };
}

export async function deleteImages(ids: (string | null | undefined)[]) {
  const list = ids.filter(isImageId);
  if (!list.length) return;
  if (hasRedis()) await db().del(...list.map(key));
  else list.forEach((id) => mem.delete(id));
}
