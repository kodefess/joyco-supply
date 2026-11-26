import Link from "next/link";

import { MascotSpot } from "@/components/mascot";
import { QuickQuote } from "@/components/quick-quote";
import { RobuxCoin3D } from "@/components/robux-coin-3d";
import type { Category } from "@/lib/catalog";
import { HERO } from "@/lib/content";
import { Arrow, Corners, Kbd, monoLabel, primaryButton, segButton } from "@/components/ui";
import type { Settings } from "@/lib/settings";
import { cn, num } from "@/lib/utils";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

/** Posisi partikel tetap (bukan acak) supaya server & client identik. */
const PARTICLES = [
  [12, 88, 0],
  [26, 72, 1400],
  [38, 92, 700],
  [55, 80, 2100],
  [68, 94, 300],
  [79, 76, 1700],
  [90, 90, 1000],
] as const;

/** Tiga nominal nyata dari katalog untuk baris "drop" di panel koin. */
function lootAmounts(categories: Category[]) {
  const all = categories.flatMap((c) => c.items.map((i) => i.robux)).filter((r): r is number => !!r);
  const uniq = [...new Set(all)].sort((a, b) => a - b);
  if (uniq.length < 3) return [80, 1_000, 10_000];
  return [uniq[0], uniq[Math.floor(uniq.length / 2)], uniq[uniq.length - 1]];
}

/** Bar kepala panel, sama persis dengan bar "Cek harga" supaya dua panel sejajar. */
function PanelBar({ label, aside }: { label: string; aside?: React.ReactNode }) {
  return (
    <div className={cn(monoLabel, "flex h-9 shrink-0 items-center justify-between bg-surface-2 px-3 text-muted-foreground")}>
      <span className="flex items-center gap-2">
        <span className="block size-1.5 bg-brand" />
        {label}
      </span>
      {aside}
    </div>
  );
}

/**
 * Hero beranda, disusun di grid ketat:
 *   [ teks + CTA ]  [ panel koin 3D | panel cek harga ]
 * Dua panel kanan sama tinggi dengan bar kepala yang sama. Tablet: teks di
 * atas, dua panel berdampingan di bawah. HP: semuanya bertumpuk.
 */
export function Hero({ categories, settings }: { categories: Category[]; settings: Settings }) {
  const loot = lootAmounts(categories);

  return (
    <section aria-labelledby="hero-title" className="arena relative overflow-clip">
      <div aria-hidden className="arena-floor">
        <i />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {PARTICLES.map(([x, y, delay]) => (
          <span key={x} className="hero-particle absolute block size-1 bg-brand-text" style={{ left: `${x}%`, top: `${y}%`, ...d(delay) }} />
        ))}
      </div>

      <div className="relative grid grid-cols-1 items-center gap-10 px-4 pt-10 pb-14 sm:px-8 sm:pt-14 sm:pb-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,47rem)] xl:gap-12">
        {/* Kiri: pesan utama */}
        {/* @container: ukuran judul mengikuti lebar kolom, bukan lebar layar. */}
        <div className="@container flex min-w-0 flex-col">
          <p className={cn(monoLabel, "fade-in flex flex-wrap items-center gap-2 text-muted-foreground")} style={d(100)}>
            <span className="flex items-center gap-2 bg-surface-2 px-2 py-1">
              <span className="blink block size-1.5 bg-success" />
              Admin online
            </span>
            {settings.hours && <Kbd className="bg-surface-2">{settings.hours}</Kbd>}
          </p>

          <h1 id="hero-title" className="mt-7 text-[clamp(2.25rem,10cqi,4.75rem)] leading-[0.92] font-bold tracking-[-0.06em]">
            {HERO.lines.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <span className={cn("rise", i === 1 && "hero-gradient-text")} style={d(150 + i * 110)}>
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <p className="fade-in mt-6 max-w-md text-[17px] leading-snug text-muted-foreground" style={d(450)}>
            {HERO.body}
          </p>

          <div className="fade-in mt-8 grid grid-cols-1 gap-[2px] sm:flex sm:flex-wrap" style={d(550)}>
            <Link href="/katalog" className={cn(primaryButton, "h-12 sm:min-w-52")}>
              Lihat katalog
              <Arrow />
            </Link>
            <Link href="/produk" className={cn(segButton, "h-12 justify-between sm:justify-start")}>
              Bandingkan jalur
            </Link>
          </div>

          <dl className={cn(monoLabel, "fade-in mt-8 grid max-w-md grid-cols-2 gap-[2px]")} style={d(650)}>
            <div className="bg-surface-2/70 px-3 py-2.5">
              <dt className="text-muted-foreground">Pembayaran</dt>
              <dd className="mt-1 text-foreground">{settings.payments}</dd>
            </div>
            <div className="bg-surface-2/70 px-3 py-2.5">
              <dt className="text-muted-foreground">Bukti</dt>
              <dd className="mt-1 text-foreground">Nota di setiap order</dd>
            </div>
          </dl>
        </div>

        {/* Kanan: dua panel sejajar, sama tinggi */}
        <div className="grid grid-cols-1 items-stretch gap-[2px] md:grid-cols-2">
          <div className="fade-in relative flex flex-col bg-surface" style={d(300)}>
            <PanelBar label="Item showcase" aside={<Kbd>3D</Kbd>} />

            <div className="relative grid flex-1 place-items-center overflow-hidden px-4 pt-4 pb-2">
              <Corners />
              <RobuxCoin3D className="w-[min(100%,17rem)]" />
              <MascotSpot pose="wave" className="absolute bottom-2 left-3 z-10" mascotClassName="w-14 sm:w-16" />
            </div>

            {/* Baris "drop": nominal paket nyata, rapi sejajar */}
            <ul aria-label="Contoh nominal" className="grid shrink-0 grid-cols-3 gap-[2px] border-t-2 border-background">
              {loot.map((amount) => (
                <li key={amount} className={cn(monoLabel, "flex items-center justify-center gap-1.5 bg-surface-2 py-2.5 font-bold text-foreground")}>
                  <span className="text-brand-text">+</span>
                  {num(amount)} R$
                </li>
              ))}
            </ul>
          </div>

          <div className="fade-in flex flex-col" style={d(400)}>
            <QuickQuote categories={categories} />
          </div>
        </div>
      </div>
    </section>
  );
}
