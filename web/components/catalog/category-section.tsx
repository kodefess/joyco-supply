import { PriceRow } from "@/components/catalog/price-row";
import { RobuxCalculator } from "@/components/catalog/robux-calculator";
import { SoldOutBanner, SoldOutTag } from "@/components/catalog/sold-out-banner";
import { PromoBadge } from "@/components/price-tag";
import { Arrow, Kbd, monoLabel, segButton } from "@/components/ui";
import { cheapestPerRobux, promoPercentFor, startingPrice, TOPUP_TYPES, type Category, type Promo } from "@/lib/catalog";
import { waLink, type Settings } from "@/lib/settings";
import { cn, num, rupiah } from "@/lib/utils";

/** Satu kategori di katalog: info menempel di kiri, daftar harga + kalkulator di kanan. */
export function CategorySection({
  category,
  index,
  promo,
  contact,
}: {
  category: Category;
  index: number;
  promo: Promo;
  contact: Pick<Settings, "whatsapp" | "brand" | "messages">;
}) {
  const type = TOPUP_TYPES[category.type];
  const best = cheapestPerRobux(category, promo);
  const from = startingPrice(category, promo);
  const percent = promoPercentFor(promo, category.id);
  const hasPromoItem = category.items.some((i) => i.promoPrice !== null && i.promoPrice < i.price);
  const c = category.custom;
  const empty = category.items.length === 0 && !c.enabled;
  const soldOut = category.stock.soldOut;

  return (
    <section id={category.id} aria-labelledby={`${category.id}-title`} className="bg-background px-4 py-20 sm:px-8 sm:py-28">
      <div className={cn(monoLabel, "flex items-center justify-between gap-4 text-muted-foreground")}>
        <span className="flex items-center gap-2">
          <span className="block size-1.5 bg-brand" />
          <span className="text-foreground">{String(index + 1).padStart(2, "0")}</span>/ {type.label}
        </span>
        {soldOut ? <SoldOutTag /> : <span>{category.items.length ? `${category.items.length} paket` : c.enabled ? "Jumlah bebas" : "—"}</span>}
      </div>
      <span className="relative mt-3 block h-px bg-border-strong">
        <span data-reveal="line" className="absolute inset-0 bg-brand" />
      </span>

      <div className="mt-10 grid grid-cols-1 gap-10 sm:mt-14 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          {(percent > 0 || hasPromoItem) && (
            <PromoBadge percent={percent || undefined} label="Promo" className="mb-4" />
          )}
          <h2 id={`${category.id}-title`} className="text-[clamp(2rem,3.6vw,3rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-balance">
            {category.name}
          </h2>
          {category.summary && <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{category.summary}</p>}

          <dl className={cn(monoLabel, "mt-6 flex flex-col gap-[2px]")}>
            {category.eta && (
              <div className="flex items-center justify-between bg-surface-2 px-3 py-2.5">
                <dt className="text-muted-foreground">Estimasi</dt>
                <dd>
                  <Kbd>{category.eta}</Kbd>
                </dd>
              </div>
            )}
            {from !== null && (
              <div className="flex items-center justify-between bg-surface-2 px-3 py-2.5">
                <dt className="text-muted-foreground">Mulai</dt>
                <dd className="text-foreground normal-case tabular-nums">{rupiah(from)}</dd>
              </div>
            )}
            {c.enabled && (
              <div className="flex items-center justify-between bg-surface-2 px-3 py-2.5">
                <dt className="text-muted-foreground">Custom</dt>
                <dd className="text-right text-foreground normal-case tabular-nums">
                  {c.price ? `${rupiah(c.price)} / ${num(c.per)} Robux` : `${num(c.min)}–${num(c.max)} Robux`}
                </dd>
              </div>
            )}
          </dl>

          {category.notes.length > 0 && (
            <ul className="mt-6 flex flex-col gap-2.5">
              {category.notes.map((note) => (
                <li key={note} className="flex gap-3 text-[14px] leading-relaxed">
                  <span className="mt-[0.6em] block size-1.5 shrink-0 bg-brand" />
                  {note}
                </li>
              ))}
            </ul>
          )}

          {category.link && (
            <a href={category.link.url} target="_blank" rel="noreferrer" className={cn(segButton, "group mt-6 w-full justify-between")}>
              {category.link.label}
              <Arrow />
            </a>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          {soldOut && <SoldOutBanner category={category} contact={contact} />}
          {empty && (
            <div className="flex flex-col items-start gap-5 bg-surface p-6 sm:p-8">
              <p className="text-2xl font-semibold tracking-[-0.04em]">Harga sedang disiapkan.</p>
              <p className="text-[15px] text-muted-foreground">Tanyakan nominal yang tersedia ke admin.</p>
              <a
                href={waLink(contact.whatsapp, `Halo ${contact.brand}, saya ingin menanyakan ${category.name}.`)}
                target="_blank"
                rel="noreferrer"
                className={cn(segButton, "group")}
              >
                Tanya admin <Arrow />
              </a>
            </div>
          )}

          {category.items.length > 0 && (
            <div className="flex flex-col gap-[2px]">
              {category.items.map((item, i) => (
                <PriceRow
                  key={item.id}
                  category={category}
                  item={item}
                  promo={promo}
                  contact={contact}
                  best={best?.id === item.id}
                  delay={(i % 6) * 50}
                />
              ))}
            </div>
          )}

          {/* Kalkulator berujung tombol order, jadi disembunyikan saat stok habis. */}
          {c.enabled && !soldOut && <RobuxCalculator category={category} />}
        </div>
      </div>
    </section>
  );
}
