// Ulasan pembeli: dikirim lewat dialog rating, atau ditambahkan admin
// (mis. screenshot chat). Ditampilkan di Testimoni.

export type Review = {
  id: string;
  name: string;
  rating: number;
  message: string;
  createdAt: string;
  approved: boolean;
  /** Id gambar (lihat lib/images.ts). */
  avatar: string | null;
  photo: string | null;
  source: "user" | "admin";
};

export const REVIEW_LIMITS = { name: 40, message: 500, minMessage: 3 };
export const PER_PAGE = 60;

export const imageUrl = (id: string) => `/api/img/${id}`;

const clean = (v: unknown, max: number) =>
  typeof v === "string"
    ? v
        .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "")
        .replace(/\s+\n/g, "\n")
        .trim()
        .slice(0, max)
    : "";

/** Validasi teks ulasan. `admin` melonggarkan aturan (pesan boleh kosong bila ada foto, link boleh). */
export function parseReviewInput(
  input: unknown,
  opts: { admin?: boolean; hasPhoto?: boolean } = {},
): { error: string } | { name: string; rating: number; message: string } {
  if (!input || typeof input !== "object") return { error: "Data tidak valid." };
  const r = input as Record<string, unknown>;
  const rating = Math.round(Number(r.rating));
  const name = clean(r.name, REVIEW_LIMITS.name).replace(/\s+/g, " ");
  const message = clean(r.message, REVIEW_LIMITS.message);

  if (!(rating >= 1 && rating <= 5)) return { error: "Pilih rating 1 sampai 5." };
  if (!name) return { error: "Nama wajib diisi." };
  if (message.length < REVIEW_LIMITS.minMessage && !(opts.admin && opts.hasPhoto)) {
    return { error: "Tulis pesan minimal beberapa kata." };
  }
  if (!opts.admin && /https?:\/\/|www\./i.test(message)) return { error: "Pesan tidak boleh berisi link." };
  return { name, rating, message };
}

/** Lengkapi ulasan lama yang belum punya field baru. */
export const normalizeReview = (r: Partial<Review> & Pick<Review, "id">): Review => ({
  name: "",
  rating: 5,
  message: "",
  createdAt: new Date(0).toISOString(),
  approved: true,
  avatar: null,
  photo: null,
  source: "user",
  ...r,
});

export function reviewStats(reviews: Review[]) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));
  const total = reviews.length;
  const average = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  return { total, average, counts };
}

export const sortNewest = (a: Review, b: Review) => b.createdAt.localeCompare(a.createdAt);
