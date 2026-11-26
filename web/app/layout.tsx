import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Public_Sans, Roboto_Mono, Rubik } from "next/font/google";

import "./globals.css";
import { COLOR_SCHEME_SCRIPT } from "@/components/color-scheme-toggle";
import { RevealObserver } from "@/components/reveal-observer";
import { siteUrl } from "@/lib/site";
import { getSettings } from "@/lib/store";

// Pasangan typeface JOYCO Hub, sama dengan studio nota.
const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-public-sans" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto-mono" });
// Font tema nota "Wallet" di studio nota, dipakai ilustrasi nota.
const rubik = Rubik({ subsets: ["latin"], variable: "--font-rubik" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const url = siteUrl(s.url);
  const title = `${s.brand} — ${s.tagline}`;
  return {
    metadataBase: new URL(url),
    title: { default: title, template: `%s · ${s.brand}` },
    description: s.description,
    applicationName: s.brand,
    keywords: s.keywords,
    authors: [{ name: s.brand, url }],
    creator: s.brand,
    publisher: s.brand,
    alternates: { canonical: "/" },
    // Gambar share dari app/opengraph-image.tsx & twitter-image.tsx.
    openGraph: {
      type: "website",
      url: "/",
      siteName: s.brand,
      title,
      description: s.description,
      locale: "id_ID",
    },
    twitter: {
      card: "summary_large_image",
      site: s.handle,
      creator: s.handle,
      title,
      description: s.description,
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    icons: {
      icon: [{ url: "/joyco.png", type: "image/png", sizes: "200x200" }],
      shortcut: "/joyco.png",
      apple: "/joyco.png",
    },
  };
}

export const viewport: Viewport = {
  colorScheme: "dark light",
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  // Default gelap; skrip tema menggantinya bila pengunjung memilih terang.
  themeColor: "#0b0b0b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-theme diset script sebelum paint, jadi beda dari HTML server — wajar.
    <html lang="id" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: COLOR_SCHEME_SCRIPT }} />
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important;stroke-dashoffset:0!important}`}</style>
        </noscript>
      </head>
      <body className={`${publicSans.variable} ${robotoMono.variable} ${rubik.variable}`}>
        {children}
        <RevealObserver />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
