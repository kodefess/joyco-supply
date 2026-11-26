import { IN_STOCK, type Catalog, type CatalogItem, type CustomPricing } from "@/lib/catalog";

const noCustom: CustomPricing = { enabled: false, per: 100, price: null, min: 100, max: 10_000 };

// Isi awal katalog = price list JOYCO. Setelah admin menyimpan sekali,
// data diambil dari Redis dan file ini hanya jadi cadangan.

const packs = (rows: [number, number][], prefix: string): CatalogItem[] =>
  rows.map(([robux, price]) => ({ id: `${prefix}${robux}`, robux, label: "", price, promoPrice: null }));

export const SEED_CATALOG: Catalog = {
  updatedAt: "2026-11-26T00:00:00.000Z",
  categories: [
    {
      id: "vilog-regular",
      name: "Robux Vilog Regular",
      type: "username",
      summary: "Top up langsung ke akunmu. Cukup kirim username.",
      eta: "Diproses admin",
      notes: [],
      link: null,
      visible: true,
      stock: IN_STOCK,
      // Tarif Rp 16.000 per 100 Robux (Rp 160/Robux); paket mengikuti tarif.
      items: packs(
        [
          [80, 12_800],
          [160, 25_600],
          [240, 38_400],
          [320, 51_200],
          [500, 80_000],
          [1_000, 160_000],
          [1_500, 240_000],
          [2_000, 320_000],
          [3_000, 480_000],
          [4_000, 640_000],
          [5_000, 800_000],
          [10_000, 1_600_000],
        ],
        "vr",
      ),
      custom: { enabled: true, per: 100, price: 16_000, min: 80, max: 10_000 },
    },
    {
      id: "gamepass-5d",
      name: "Robux Gamepass 5 Days",
      type: "gamepass",
      summary: "Kamu buat gamepass, admin membelinya. Robux masuk setelah masa pending Roblox.",
      eta: "5 hari",
      notes: ["Roblox memotong 30% dari penjualan gamepass. Harga gamepass yang perlu kamu set muncul di kalkulator."],
      link: null,
      visible: true,
      stock: IN_STOCK,
      items: [],
      custom: { enabled: true, per: 100, price: 12_500, min: 100, max: 20_000 },
    },
    {
      id: "komunitas",
      name: "Robux via Komunitas",
      type: "komunitas",
      summary: "Robux dikirim lewat payout komunitas. Langsung masuk tanpa delay.",
      eta: "Instan",
      notes: ["Wajib join komunitas selama 14 hari untuk pembelian pertama."],
      link: { label: "Komunitas BASEMENT", url: "https://www.roblox.com/communities/921002174/BASEMENT" },
      visible: true,
      stock: IN_STOCK,
      // Tarif saja: pembeli mengetik jumlah, Rp 12.500 per 100 Robux.
      items: [],
      custom: { enabled: true, per: 100, price: 12_500, min: 100, max: 10_000 },
    },
    {
      id: "roblox-plus",
      name: "Roblox Plus",
      type: "username",
      summary: "Langganan Roblox Plus untuk akunmu.",
      eta: "Diproses admin",
      notes: [],
      link: null,
      visible: true,
      stock: IN_STOCK,
      items: [{ id: "plus", robux: null, label: "Roblox Plus", price: 50_000, promoPrice: null }],
      custom: noCustom,
    },
    {
      id: "digital-card",
      name: "Roblox Digital Card",
      type: "card",
      summary: "Kode digital card, ditukar sendiri di roblox.com/redeem.",
      eta: "Kode via chat",
      notes: [],
      link: null,
      visible: true,
      stock: IN_STOCK,
      items: packs(
        [
          [840, 120_000],
          [1_050, 155_000],
        ],
        "dc",
      ),
      custom: noCustom,
    },
  ],
};
