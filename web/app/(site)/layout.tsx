import { AnalyticsEvents } from "@/components/analytics-events";
import { PromoBar } from "@/components/promo-bar";
import { SettingsProvider } from "@/components/settings-context";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SmoothScroll } from "@/components/smooth-scroll";
import { MascotDefs } from "@/components/mascot";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import { socialHref, toPublicSettings, visibleSocials } from "@/lib/settings";
import { siteUrl } from "@/lib/site";
import { getSettings } from "@/lib/store";

// Halaman publik: smooth scroll + header/footer. Admin punya layout sendiri.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const url = siteUrl(settings.url);

  // Data terstruktur untuk mesin pencari: identitas toko + akun sosialnya.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#org`,
        name: settings.brand,
        url,
        logo: `${url}/joyco.png`,
        description: settings.description,
        sameAs: visibleSocials(settings).map(socialHref).filter(Boolean),
      },
      { "@type": "WebSite", "@id": `${url}/#site`, name: settings.brand, url, inLanguage: "id-ID", publisher: { "@id": `${url}/#org` } },
    ],
  };

  return (
    <SettingsProvider settings={toPublicSettings(settings)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SmoothScroll>
        <PromoBar />
        <SiteHeader />
        <main className="flex flex-col gap-[2px]">{children}</main>
        <SiteFooter settings={settings} />
      </SmoothScroll>
      <WhatsAppCta />
      <MascotDefs />
      <AnalyticsEvents />
    </SettingsProvider>
  );
}
