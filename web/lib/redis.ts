import "server-only";

import { Redis } from "@upstash/redis";

// Koneksi Upstash/Vercel KV. Vercel menamai env sesuai prefix yang dipilih
// saat "Connect Project" (default "KV" → KV_REST_API_URL), jadi di sini
// semua variasi diterima: UPSTASH_REDIS_REST_*, KV_REST_API_*, atau
// <PREFIX>_KV_REST_API_* / <PREFIX>_REST_API_*.

function findEnv(suffixes: string[]) {
  for (const s of suffixes) {
    if (process.env[s]) return process.env[s];
  }
  const key = Object.keys(process.env).find((k) => suffixes.some((s) => k.endsWith(`_${s}`)) && process.env[k]);
  return key ? process.env[key] : undefined;
}

const url = () => findEnv(["UPSTASH_REDIS_REST_URL", "KV_REST_API_URL"]);
// Token read-only tidak bisa menulis, jadi sengaja tidak dipakai.
const token = () => findEnv(["UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_TOKEN"]);

export const hasRedis = () => Boolean(url() && token());

let client: Redis | undefined;
export const redis = () => (client ??= new Redis({ url: url()!, token: token()! }));
