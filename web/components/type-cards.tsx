import { Gift, IdCard, Ticket, UsersRound, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { Arrow, Corners, monoLabel } from "@/components/ui";
import { TOPUP_TYPE_KEYS, TOPUP_TYPES, restockLabel, startingPrice, type Category, type Promo, type TopupType } from "@/lib/catalog";
import { TYPE_META } from "@/lib/content";
import { cn, rupiah } from "@/lib/utils";

const GLYPH: Record<TopupType, LucideIcon> = {
  username: IdCard,
  gamepass: Ticket,
  komunitas: UsersRound,
  card: Gift,
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-4">
      <span className={cn(monoLabel, "w-20 text-[10px] text-muted-foreground")}>{label}</span>
      <span className="stat-bar flex-1" role="img" aria-label={`${label} ${value} dari 3`}>
        {[1, 2, 3].map((n) => (
          <i key={n} data-on={n <= value ? "" : undefined} />
        ))}
      </span>
    </div>
  );
}

/** Empat jenis top up sebagai "kartu item": slot ikon, label rarity, statistik, harga mulai. */
export function TypeCards({ categories, promo }: { categories: Category[]; promo: Promo }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {TOPUP_TYPE_KEYS.map((key, i) => {
        const type = TOPUP_TYPES[key];
        const meta = TYPE_META[key];
        const Glyph = GLYPH[key];
        const cats = categories.filter((c) => c.type === key);
        const prices = cats.map((c) => startingPrice(c, promo)).filter((p): p is number => p !== null);
        const from = prices.length ? Math.min(...prices) : null;
        const first = cats[0];
        const soldOut = cats.length > 0 && cats.every((c) => c.stock.soldOut);

        return (
          <Link
            key={key}
            href={first ? `/katalog#${first.id}` : "/katalog"}
            data-reveal="up"
            style={{ "--d": `${[0, 60, 100, 130][i]}ms` } as React.CSSProperties}
            className="press press-soft group relative flex flex-col border border-border bg-surface transition-[border-color] hover:border-brand/40"
          >
            <Corners hover />

            {/* Slot item */}
            <div className={cn("item-slot relative grid aspect-[2/1] place-items-center overflow-hidden border-b border-border sm:aspect-[16/11]", soldOut && "soldout-stripes")}>
              <span className={cn(monoLabel, "absolute top-4 left-4 text-brand-text")}>{type.code}</span>
              <span className={cn(monoLabel, "absolute top-4 right-4 bg-foreground px-2 py-1 text-[10px] text-background")}>
                {meta.tag}
              </span>
              <Glyph aria-hidden strokeWidth={1.25} className={cn("item-glyph size-14 text-foreground sm:size-24", soldOut && "opacity-25")} />
              {soldOut && <span className="soldout-stamp absolute">Stok habis</span>}
            </div>

            <div className="flex flex-1 flex-col p-6 sm:p-7">
              <h3 className="text-[clamp(1.6rem,2.4vw,2rem)] leading-[0.95] font-bold tracking-[-0.05em]">{type.label}</h3>
              {first?.eta && (
                <p className={cn(monoLabel, "mt-3 flex items-center gap-2 text-[10px] text-muted-foreground")}>
                  <span aria-hidden className="block size-1 bg-brand" />
                  Estimasi · <span className="text-foreground">{first.eta}</span>
                </p>
              )}
              <div className="mt-7 flex flex-col gap-3">
                <Stat label="Kecepatan" value={meta.speed} />
                <Stat label="Kemudahan" value={meta.ease} />
              </div>
              {/* Pengisi fleksibel: harga selalu di dasar kartu, minimal 2rem dari statistik. */}
              <div aria-hidden className="min-h-8 flex-1" />
              <div className="flex items-end justify-between gap-3 border-t border-border pt-5">
                <div>
                  <p className={cn(monoLabel, "text-[10px]", soldOut ? "text-[var(--stock)]" : "text-muted-foreground")}>
                    {soldOut ? restockLabel(first.stock) : "Mulai"}
                  </p>
                  <p className={cn("text-xl font-bold tracking-[-0.03em] tabular-nums", soldOut && "text-muted-foreground line-through decoration-1")}>
                    {from !== null ? rupiah(from) : "Tanya admin"}
                  </p>
                </div>
                <span className="grid size-10 place-items-center bg-surface-2 transition-colors duration-200 group-hover:bg-brand group-hover:text-brand-foreground">
                  <Arrow />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
