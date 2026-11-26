# JOYCO Mart — joycomart.vercel.app

Situs top up Robux JOYCO. Bahasa visual sama dengan studio nota
(`../`, JOYCO Supply): token abu bertingkat, aksen `#1337FF`, celah 2px,
label Roboto Mono.

```bash
pnpm install
pnpm dev        # http://localhost:3002
```

## Halaman

| Rute         | Isi                                                                  |
| ------------ | -------------------------------------------------------------------- |
| `/`          | Beranda, cek harga cepat (paket atau jumlah custom)                  |
| `/produk`    | Cara kerja 4 jenis top up                                            |
| `/katalog`   | Daftar harga per kategori, harga coret saat promo, kalkulator custom |
| `/testimoni` | Ringkasan rating per bintang + ulasan dari dialog "Tulis ulasan"     |
| `/admin`     | Katalog · Promo · Ulasan · Pengaturan (brand, SEO, kontak, sosial)   |

Data disimpan di Upstash Redis (`joycomart:catalog`, `joycomart:settings`,
`joycomart:reviews`). Halaman publik statis (ISR 5 menit) dan dibangun ulang
otomatis setiap admin menyimpan atau ada ulasan baru. Tanpa env Redis (dev
lokal), data hanya di memori dan hilang saat server restart.

### Harga
- **Paket** — daftar jumlah + harga. Isi *Harga promo* di item untuk harga coret.
- **Jumlah custom** — per kategori: *Tarif tetap* (mis. Rp 10.000 per 100 →
  150 Robux = Rp 15.000) atau *Ikut tarif paket* (tarif paket terbesar ≤ jumlah).
  Hasil dibulatkan ke atas per Rp 100.
- **Promo** — bar promo + countdown, diskon persen untuk kategori terpilih.

### Ulasan
Siapa pun bisa kirim rating 1–5, nama, dan pesan (maks 3 per IP per jam,
link ditolak, ada honeypot). Admin bisa sembunyikan/hapus, atau aktifkan
"perlu disetujui" di Pengaturan.

## Deploy (Vercel)

Project baru dari repo ini dengan **Root Directory = `web`**. Env (lihat `.env.example`):

- `ADMIN_PASSWORD` — password `/admin`
- `KV_REST_API_URL`, `KV_REST_API_TOKEN` — Upstash Redis / Vercel KV (boleh database yang sama dengan netnot).
  Cara termudah: Vercel → Storage → database KV → **Connect Project** → pilih project ini.
  Prefix env bebas (`KV_…`, `STORAGE_KV_…`, `UPSTASH_REDIS_REST_…` semua dikenali). Redeploy setelahnya.

Cek: buka `/admin` — bar atas harus bertuliskan **"Tersimpan di Redis"**, bukan "Mode memori".
- `NEXT_PUBLIC_WA_NUMBER` — opsional, nilai awal WhatsApp sebelum diatur di admin

`lib/catalog-seed.ts` dan `DEFAULT_SETTINGS` di `lib/settings.ts` adalah isi awal sebelum admin menyimpan.
