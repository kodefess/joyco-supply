// Hal statis yang bukan pengaturan admin. Identitas brand, kontak, sosial,
// dan SEO ada di lib/settings.ts (bisa diubah dari /admin).

/** Origin untuk dev; production memakai Settings.url. */
export const DEV_URL = "http://localhost:3002";

export const siteUrl = (settingsUrl: string) =>
  process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.NODE_ENV === "development" ? DEV_URL : settingsUrl);

/** Situs nota JOYCO (netnot), ditautkan dari footer. */
export const RECEIPT_URL = "https://joycosupply.vercel.app";

export const NAV = [
  { href: "/", label: "Beranda", code: "01" },
  { href: "/produk", label: "Produk", code: "02" },
  { href: "/katalog", label: "Katalog", code: "03" },
  { href: "/testimoni", label: "Testimoni", code: "04" },
] as const;
