import { type NextRequest, NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin-auth";
import { uid } from "@/lib/catalog";
import { deleteImages, saveImage } from "@/lib/images";
import { parseReviewInput } from "@/lib/reviews";
import { addReview, deleteReview, getAllReviews, updateReview } from "@/lib/store";

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return NextResponse.json(await getAllReviews());
}

/** Admin menambah testimoni, mis. dengan screenshot chat sebagai foto. */
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return unauthorized();
  const body = await request.json().catch(() => null);
  const parsed = parseReviewInput(body, { admin: true, hasPhoto: Boolean(body?.photo) });
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const saved: string[] = [];
  try {
    const avatar = body.avatar ? await saveImage(body.avatar, "avatar") : null;
    if (avatar) saved.push(avatar);
    const photo = body.photo ? await saveImage(body.photo, "photo") : null;
    if (photo) saved.push(photo);
    const when = typeof body.createdAt === "string" && !Number.isNaN(Date.parse(body.createdAt)) ? new Date(body.createdAt) : new Date();
    const review = {
      id: `${Date.now().toString(36)}${uid()}`,
      ...parsed,
      createdAt: when.toISOString(),
      approved: true,
      avatar,
      photo,
      source: "admin" as const,
    };
    await addReview(review);
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    await deleteImages(saved);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menyimpan." }, { status: 400 });
  }
}

/** Tampilkan / sembunyikan ulasan. */
export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) return unauthorized();
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id.slice(0, 60) : "";
  if (!id || typeof body?.approved !== "boolean") return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  const ok = await updateReview(id, { approved: body.approved });
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Ulasan tidak ditemukan." }, { status: 404 });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) return unauthorized();
  const id = request.nextUrl.searchParams.get("id")?.slice(0, 60);
  if (!id) return NextResponse.json({ error: "id wajib." }, { status: 400 });
  await deleteReview(id);
  return NextResponse.json({ ok: true });
}
