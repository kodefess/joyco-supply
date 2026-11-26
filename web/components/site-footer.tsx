import Link from "next/link";

import { LogoMark } from "@/components/logo";
import { MascotSpot } from "@/components/mascot";
import { Wordmark } from "@/components/wordmark";
import { Arrow, Diamond, MaskHeading, monoLabel, primaryButton, segButton } from "@/components/ui";
import { generalLink, socialHref, visibleSocials, type Settings } from "@/lib/settings";
import { NAV, RECEIPT_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteFooter({ settings }: { settings: Settings }) {
  const host = settings.url.replace(/^https?:\/\//, "");
  const socials = visibleSocials(settings);
  return (
    <footer className="mt-[2px] flex flex-col gap-[2px]">
      {/* Ajakan terakhir — arena gelap, pasangan hero. */}
      <section className="arena relative grid grid-cols-1 gap-[2px] overflow-clip lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div aria-hidden className="arena-floor">
          <i />
        </div>
        <div className="px-4 py-20 sm:px-8 sm:py-28">
          <p className={cn(monoLabel, "mb-8 flex items-center gap-2 text-muted-foreground")}>
            <span className="blink block size-1.5 bg-success" />
            Admin online {settings.hours}
          </p>
          <MaskHeading
            className="text-[clamp(2.75rem,8vw,7rem)] leading-[0.88] font-bold"
            lines={["Siap order?", <span key="b" className="text-brand-text">Hubungi admin.</span>]}
          />
          <MascotSpot pose="wave" say="Admin siap membantu" side="right" className="mt-10" mascotClassName="w-24 sm:w-32" />
        </div>
        <div className="flex flex-col justify-end gap-[2px] p-4 sm:p-8 lg:pl-0">
          <p className="mb-6 max-w-xs text-[15px] leading-snug text-muted-foreground">Sebutkan jenis, jumlah, dan username. Admin memproses sisanya.</p>
          <a href={generalLink(settings)} target="_blank" rel="noreferrer" data-wa-cta className={cn(primaryButton, "h-14")}>
            Chat admin
            <Arrow />
          </a>
          <Link href="/katalog" className={cn(segButton, "h-12 justify-between")}>
            Lihat katalog
            <Arrow />
          </Link>
        </div>
      </section>

      {/* Wordmark raksasa bergaya lembar spesimen huruf */}
      <div className="relative overflow-clip bg-surface px-4 pt-10 pb-6 sm:px-8 sm:pt-14 sm:pb-8">
        <Wordmark text={settings.brand} />
      </div>

      {/* Sosial media */}
      {socials.length > 0 && (
        <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(10rem, 1fr))` }}>
          {socials.map((s) => {
            const href = socialHref(s);
            const inner = (
              <>
                <span className={cn(monoLabel, "text-muted-foreground")}>{s.label}</span>
                <span className="mt-6 flex items-end justify-between gap-3">
                  <span className="text-xl font-semibold tracking-[-0.03em]">{s.handle || host}</span>
                  {href && <Arrow />}
                </span>
                {href && (
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-brand transition-transform duration-400 ease-out-expo group-hover:scale-x-100" />
                )}
              </>
            );
            return href ? (
              <a key={s.id} href={href} target="_blank" rel="noreferrer me" className="press press-soft group relative flex flex-col bg-surface p-5 hover:bg-surface-2 sm:p-7">
                {inner}
              </a>
            ) : (
              <div key={s.id} className="relative flex flex-col bg-surface p-5 sm:p-7">
                {inner}
              </div>
            );
          })}
        </div>
      )}

      {/* Tautan & catatan hukum */}
      <div className="grid grid-cols-1 gap-[2px] sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-start gap-3 bg-surface-2 p-5 sm:p-6">
          <LogoMark className="size-6 text-brand-text" />
          <p className={cn(monoLabel, "leading-relaxed text-muted-foreground")}>
            <b className="font-medium text-foreground">{settings.brand}</b>
            <br />
            {settings.tagline}
          </p>
        </div>
        <nav aria-label="Footer" className={cn(monoLabel, "flex flex-col gap-2.5 bg-surface-2 p-5 sm:p-6")}>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="link-line w-fit text-muted-foreground hover:text-foreground">
              {item.code} — {item.label}
            </Link>
          ))}
        </nav>
        <div className={cn(monoLabel, "flex flex-col gap-2.5 bg-surface-2 p-5 text-muted-foreground sm:p-6")}>
          <span>Buka tiap hari</span>
          <span className="text-foreground">{settings.hours || "—"}</span>
          <span>Bayar {settings.payments}</span>
          <a href={RECEIPT_URL} className="link-line mt-auto w-fit hover:text-foreground">
            Studio nota JOYCO ↗
          </a>
        </div>
        <p className="bg-surface-2 p-5 text-[12px] leading-relaxed text-muted-foreground sm:p-6">
          {settings.brand} tidak berafiliasi dengan Roblox Corporation. Roblox dan Robux adalah merek dagang milik Roblox
          Corporation.
        </p>
      </div>

      <div className={cn(monoLabel, "flex items-center justify-between gap-4 bg-surface-2 px-4 py-3 text-muted-foreground")}>
        <span className="flex items-center gap-2">
          <Diamond className="size-3" />© {new Date().getFullYear()} {settings.brand}
        </span>
        <span>{host}</span>
      </div>
    </footer>
  );
}
