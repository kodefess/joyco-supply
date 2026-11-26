import { createHash } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

import { uid } from "@/lib/catalog";
import { saveImage } from "@/lib/images";
import { parseReviewInput } from "@/lib/reviews";
import { addReview, getSettingsFresh, rateLimit } from "@/lib/store";

const LIMIT = 3; // ulasan per IP
const WINDOW = 60 * 60; // per jam

/** Kirim ulasan dari dialog rating publik. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  // Honeypot: field tersembunyi yang hanya diisi bot.
  if (body && typeof body === "object" && (body as Record<string, unknown>).website) {
    return NextResponse.json({ ok: true, pending: true });
  }

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  const ipId = createHash("sha256").update(`joycomart:${ip}`).digest("hex").slice(0, 24);
  if (!(await rateLimit(`review:${ipId}`, LIMIT, WINDOW))) {
    return NextResponse.json({ error: "Terlalu banyak ulasan dari jaringan ini. Coba lagi nanti." }, { status: 429 });
  }

  const parsed = parseReviewInput(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  // Avatar opsional; sudah di-resize di browser, divalidasi ulang di server.
  let avatar: string | null = null;
  const rawAvatar = (body as Record<string, unknown>).avatar;
  if (rawAvatar) {
    try {
      avatar = await saveImage(rawAvatar, "avatar");
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Gambar tidak valid." }, { status: 400 });
    }
  }

  const settings = await getSettingsFresh();
  const review = {
    id: `${Date.now().toString(36)}${uid()}`,
    ...parsed,
    createdAt: new Date().toISOString(),
    approved: !settings.moderateReviews,
    avatar,
    photo: null,
    source: "user" as const,
  };

  try {
    await addReview(review);
  } catch (error) {
    console.error("Gagal menyimpan ulasan", error);
    return NextResponse.json({ error: "Gagal menyimpan ulasan. Coba lagi." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, pending: !review.approved, review: review.approved ? review : null }, { status: 201 });
}
