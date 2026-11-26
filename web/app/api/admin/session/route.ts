import { type NextRequest, NextResponse } from "next/server";

import {
  ADMIN_COOKIE,
  ATTEMPTS_COOKIE,
  LOCK_SECONDS,
  MAX_ATTEMPTS,
  SESSION_SECONDS,
  checkPassword,
  cookieOptions,
  isConfigured,
  sessionToken,
} from "@/lib/admin-auth";

/** Login admin. Batas percobaan ditegakkan di server lewat cookie. */
export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "ADMIN_PASSWORD belum diset di server." }, { status: 500 });
  }

  const attempts = Number(request.cookies.get(ATTEMPTS_COOKIE)?.value) || 0;
  if (attempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi 10 menit lagi." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (checkPassword(password)) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, sessionToken(), { ...cookieOptions, maxAge: SESSION_SECONDS });
    res.cookies.delete(ATTEMPTS_COOKIE);
    return res;
  }

  const left = MAX_ATTEMPTS - attempts - 1;
  const res = NextResponse.json(
    { error: left > 0 ? `Password salah. Sisa ${left} percobaan.` : "Terkunci 10 menit." },
    { status: left > 0 ? 401 : 429 },
  );
  res.cookies.set(ATTEMPTS_COOKIE, String(attempts + 1), { ...cookieOptions, maxAge: LOCK_SECONDS });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return res;
}
