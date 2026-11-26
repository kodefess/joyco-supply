import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "joycomart_admin";
export const ATTEMPTS_COOKIE = "joycomart_admin_attempts";
export const MAX_ATTEMPTS = 5;
export const LOCK_SECONDS = 60 * 10;
export const SESSION_SECONDS = 60 * 60 * 24 * 7;

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const password = () => process.env.ADMIN_PASSWORD ?? "";

// Isi cookie = HMAC dari password, bukan password-nya. Ganti password di env
// otomatis membatalkan semua sesi lama.
export const sessionToken = () => createHmac("sha256", password()).update("joycomart-admin-v1").digest("hex");

const hash = (s: string) => createHash("sha256").update(s).digest();
export const safeEqual = (a: string, b: string) => timingSafeEqual(hash(a), hash(b));

export const isConfigured = () => password().length > 0;

export async function isAdmin() {
  if (!isConfigured()) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(value) && safeEqual(value!, sessionToken());
}

export const checkPassword = (input: string) => isConfigured() && input.length > 0 && safeEqual(input, password());
