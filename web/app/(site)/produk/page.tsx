import type { Metadata } from "next";
import Link from "next/link";

import { SoldOutBanner, SoldOutTag } from "@/components/catalog/sold-out-banner";
import { PageIntro } from "@/components/page-intro";
import { Arrow, Corners, Kbd, monoLabel, primaryButton, segButton } from "@/components/ui";
import { TOPUP_TYPE_KEYS, TOPUP_TYPES, startingPrice } from "@/lib/catalog";
import { getPublicCatalog, getSettings } from "@/lib/store";
import { TYPE_GUIDE, TYPE_META } from "@/lib/content";
import { cn, rupiah } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Produk",
  description: "Empat jalur top up Robux di JOYCO: username, gamepass, komunitas, dan Digital Card. Cara kerja dan syarat.",
  alternates: { canonical: "/produk" },
};

export const revalidate = 300;

export default async function ProdukPage() {
  const [{ categories }, settings] = await Promise.all([getPublicCatalog(), getSettings()]);

  return (
    <>
      <PageIntro
        code="02"
        label="Produk"
        lines={["Empat jalur.", <span key="b" className="text-brand-text">Pilih yang sesuai.</span>]}
        body="Cara kerja dan syarat setiap jalur. Harga tersedia di katalog."
        aside={
          <Link href="/katalog" className={cn(primaryButton, "h-12")}>
            Lihat harga
            <Arrow />
          </Link>
        }
      />

      <section className="bg-background px-4 py-16 sm:px-8 sm:py-24">
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
          {TOPUP_TYPE_KEYS.map((key, i) => {
            const type = TOPUP_TYPES[key];
            const guide = TYPE_GUIDE[key];
            const cats = categories.filter((c) => c.type === key);
            const first = cats[0];
            const prices = cats.map((c) => startingPrice(c, settings.promo)).filter((p): p is number => p !== null);
            const from = prices.length ? Math.min(...prices) : null;

            return (
              <article
                key={key}
                id={key}
                aria-labelledby={`${key}-title`}
                data-reveal="up"
                style={{ "--d": `${[0, 60, 0, 60][i]}ms` } as React.CSSProperties}
                className="relative flex scroll-mt-24 flex-col border border-border bg-surface"
              >
                <Corners />
                <header className={cn(monoLabel, "flex h-10 items-center justify-between gap-3 border-b border-border px-5 text-muted-foreground")}>
                  <span>
                    <span className="text-brand-text">{type.code}</span> / {TYPE_META[key].tag}
                  </span>
                  {cats.length > 0 && cats.every((c) => c.stock.soldOut) ? <SoldOutTag /> : first?.eta && <Kbd className="bg-surface-2">{first.eta}</Kbd>}
                </header>

                <div className="flex flex-1 flex-col p-5 sm:p-8">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <h2 id={`${key}-title`} className="text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[0.9] font-bold tracking-[-0.06em]">
                      {type.label}
                    </h2>
                    {from !== null && (
                      <p className="sm:text-right">
                        <span className={cn(monoLabel, "block text-[10px] text-muted-foreground")}>Mulai</span>
                        <span className="text-xl font-bold tracking-[-0.03em] tabular-nums">{rupiah(from)}</span>
                      </p>
                    )}
                  </div>

                  {cats
                    .filter((c) => c.stock.soldOut)
                    .map((c) => (
                      <SoldOutBanner key={c.id} category={c} contact={settings} compact className="mt-6" />
                    ))}

                  <ul aria-label="Yang dibutuhkan" className={cn(monoLabel, "mt-6 flex flex-wrap gap-[2px]")}>
                    {guide.need.map((n) => (
                      <li key={n} className="bg-surface-2 px-2.5 py-1.5 text-foreground">
                        {n}
                      </li>
                    ))}
                  </ul>

                  <ol className="mt-8 flex flex-col gap-1.5">
                    {guide.how.map((step, s) => (
                      <li key={step} className="flex items-center gap-4 bg-background px-4 py-3.5">
                        <span className={cn(monoLabel, "grid size-7 shrink-0 place-items-center bg-brand font-bold text-brand-foreground")}>
                          {s + 1}
                        </span>
                        <span className="text-[16px] leading-snug">{step}</span>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-auto flex flex-col gap-[2px] pt-8">
                    {cats.map((c) => (
                      <Link key={c.id} href={`/katalog#${c.id}`} className={cn(segButton, "h-12 justify-between")}>
                        <span className="truncate">{cats.length > 1 ? c.name : "Lihat harga"}</span>
                        <Arrow />
                      </Link>
                    ))}
                    {cats
                      .filter((c) => c.link)
                      .map((c) => (
                        <a key={`${c.id}-link`} href={c.link!.url} target="_blank" rel="noreferrer" className={cn(primaryButton, "h-12")}>
                          {c.link!.label}
                          <Arrow />
                        </a>
                      ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
