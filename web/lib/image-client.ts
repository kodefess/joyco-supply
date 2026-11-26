// Kecilkan gambar di browser sebelum diunggah: hemat kuota & cepat dimuat.

async function load(file: File) {
  if ("createImageBitmap" in window) return createImageBitmap(file);
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Hasil data URL WebP (JPEG bila browser tidak bisa encode WebP).
 * `square` = potong tengah jadi persegi (untuk avatar).
 */
export async function resizeImage(file: File, { max, square = false, quality = 0.82 }: { max: number; square?: boolean; quality?: number }) {
  if (!file.type.startsWith("image/")) throw new Error("Pilih file gambar.");
  if (file.size > 15_000_000) throw new Error("File terlalu besar (maks 15 MB).");
  const img = await load(file);
  const w = img.width;
  const h = img.height;

  let sx = 0, sy = 0, sw = w, sh = h;
  if (square) {
    const side = Math.min(w, h);
    sx = (w - side) / 2;
    sy = (h - side) / 2;
    sw = sh = side;
  }
  const scale = Math.min(1, max / Math.max(sw, sh));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  let out = canvas.toDataURL("image/webp", quality);
  if (!out.startsWith("data:image/webp")) out = canvas.toDataURL("image/jpeg", quality);
  return out;
}
