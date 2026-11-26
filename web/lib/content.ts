import type { TopupType } from "@/lib/catalog";

// Konten statis. Harga TIDAK di sini — harga dikelola di /admin.
// Ulasan tidak di sini — dikirim pembeli lewat dialog rating (lib/reviews.ts).
// Gaya copy: tegas, profesional, langsung ke inti. Satu ide per kalimat.
// Tanpa slang, tanpa basa-basi; sapaan dihindari bila tidak perlu.

/** Hero beranda. Tagline admin tetap dipakai untuk SEO & footer. */
export const HERO = {
  lines: ["Build underground.", "Trusted everywhere."],
  body: "Top up Robux dengan harga transparan, admin responsif, dan nota resmi di setiap order.",
};

/** Kartu "item" tiap jenis top up: label + statistik ala game. */
export const TYPE_META: Record<TopupType, { tag: string; speed: number; ease: number }> = {
  username: { tag: "Paling mudah", speed: 3, ease: 3 },
  gamepass: { tag: "Pending 5 hari", speed: 1, ease: 2 },
  komunitas: { tag: "Langsung masuk", speed: 3, ease: 2 },
  card: { tag: "Untuk hadiah", speed: 3, ease: 3 },
};

/** Cara kerja tiap jenis top up, untuk halaman Produk. */
export const TYPE_GUIDE: Record<TopupType, { how: string[]; need: string[] }> = {
  username: {
    how: ["Kirim username dan paket.", "Selesaikan pembayaran.", "Robux dikirim ke akun."],
    need: ["Username"],
  },
  gamepass: {
    how: ["Buat gamepass sesuai harga di kalkulator.", "Kirim link gamepass, lalu bayar.", "Robux masuk setelah pending 5 hari."],
    need: ["Username", "Link gamepass"],
  },
  komunitas: {
    how: ["Bergabung ke komunitas JOYCO.", "Tunggu 14 hari (khusus order pertama).", "Order. Robux langsung masuk."],
    need: ["Username", "Anggota 14 hari"],
  },
  card: {
    how: ["Pilih nominal.", "Selesaikan pembayaran.", "Kode dikirim; tukarkan di roblox.com/redeem."],
    need: ["Akun Roblox"],
  },
};

export const STEPS = [
  { title: "Pilih", body: "Tentukan jenis dan jumlah di katalog." },
  { title: "Chat", body: "Pesan WhatsApp terisi otomatis." },
  { title: "Bayar", body: "QRIS, transfer, atau e-wallet." },
  { title: "Selesai", body: "Robux dikirim, nota digital menyusul." },
];

/** Nota digital di setiap order — satu baris per poin. */
export const RECEIPT_POINTS = [
  { title: "Bukti sah", body: "Nomor order, rincian, dan waktu transaksi." },
  { title: "Mudah dicari", body: "Tersimpan sebagai gambar, tidak tenggelam di chat." },
  { title: "Siap diteruskan", body: "Untuk orang tua atau rekan patungan." },
];

export const FAQ = [
  {
    q: "Apa beda username, gamepass, dan komunitas?",
    a: "Username: cukup kirim username. Gamepass: Robux masuk setelah pending 5 hari. Komunitas: Robux langsung masuk lewat payout, dengan syarat sudah bergabung 14 hari.",
  },
  {
    q: "Mengapa harga gamepass lebih tinggi dari jumlah Robux?",
    a: "Roblox memotong 30% dari setiap penjualan gamepass. Untuk 1.000 Robux, set gamepass di 1.429 Robux. Kalkulator di katalog menghitungnya otomatis.",
  },
  {
    q: "Apakah ada bukti transaksi?",
    a: "Ya. Setiap order yang selesai mendapat nota digital berisi nomor order, rincian, dan waktu transaksi.",
  },
  {
    q: "Robux belum masuk?",
    a: "Untuk gamepass, cek Roblox → Transactions; Robux yang pending tercatat di sana. Untuk jalur lain, hubungi admin di percakapan order yang sama.",
  },
];
