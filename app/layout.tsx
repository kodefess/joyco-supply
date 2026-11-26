import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";

import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { SITE } from "@/lib/site";
import { COLOR_SCHEME_SCRIPT } from "@/components/color-scheme-toggle";

// Copy metadata versi Indonesia (SITE di lib/ tetap jadi sumber nama & URL).
const DESCRIPTION = "Studio nota JOYCO. Buat nota sesuai brand, unduh sebagai PNG atau cetak dalam hitungan detik.";
const LOCALE = "id_ID";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s · ${SITE.title}`,
  },
  description: DESCRIPTION,
  applicationName: SITE.title,
  generator: SITE.title,
  keywords: ["JOYCO", "JOYCO Supply", "receipt generator", "receipt maker", "nota", "struk", "invoice", "bikin nota", "nota online"],
  alternates: { canonical: "/" },
  // Gambar share otomatis dari app/opengraph-image.tsx & twitter-image.tsx.
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE.title,
    title: SITE.title,
    description: DESCRIPTION,
    locale: LOCALE,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: DESCRIPTION,
  },
  // Favicon = logo JOYCO.
  icons: {
    icon: [{ url: "/joyco.png", type: "image/png", sizes: "200x200" }],
    shortcut: "/joyco.png",
    apple: "/joyco.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  // Default gelap; skrip tema menggantinya bila pengunjung memilih terang.
  themeColor: "#0b0b0b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-theme diset oleh script sebelum paint, jadi atributnya memang
    // berbeda dari HTML server — wajar, bukan bug hydration.
    <html lang="id" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: COLOR_SCHEME_SCRIPT }} />
      </head>
      <body className={fontVariables}>
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
