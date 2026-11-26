import { PriceTag } from "@/components/price-tag";
import { Arrow, monoLabel } from "@/components/ui";
import { priceItem, type CatalogItem, type Category, type Promo } from "@/lib/catalog";
import { orderLink, type Settings } from "@/lib/settings";
import { cn, num } from "@/lib/utils";

/** Satu baris harga. Garis tengah menggambar ke kanan saat di-hover. */
export function PriceRow({
  category,
  item,
  promo,
  contact,
  best,
  delay = 0,
}: {
  category: Category;
  item: CatalogItem;
  promo: Promo;
  contact: Pick<Settings, "whatsapp" | "brand" | "messages">;
  best?: boolean;
  delay?: number;
}) {
  const priced = priceItem(item, category, promo);
  const rate = item.robux ? priced.price / item.robux : null;
  const onPromo = priced.original !== null;
  const soldOut = category.stock.soldOut;

  // Saat stok habis baris bukan link (tidak bisa dipesan); tombol "Kabari saya"
  // ada di banner kategori. Harga tetap terlihat sebagai referensi.
  const Row = soldOut ? "div" : "a";
  const linkProps = soldOut
    ? { "aria-disabled": true }
    : { href: orderLink(contact, category, item, priced.price), target: "_blank", rel: "noreferrer" };

  return (
    <Row
      {...linkProps}
      data-reveal="up"
      style={{ "--d": `${delay}ms` } as React.CSSProperties}
      className={cn(
        soldOut && "soldout-row pointer-events-none",
        "press press-soft group relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 bg-surface px-4 py-3.5 hover:bg-background sm:py-5 sm:grid-cols-[9rem_minmax(0,1fr)_auto_auto] sm:px-5",
        onPromo && "bg-brand/[0.06]",
      )}
    >
      {onPromo && <span aria-hidden className="absolute inset-y-0 left-0 w-[2px] bg-brand" />}

      <span className="flex items-baseline gap-2">
        {item.robux !== null ? (
          <>
            <span className="text-[1.4rem] leading-none font-semibold tracking-[-0.05em] tabular-nums sm:text-[1.65rem]">{num(item.robux)}</span>
            <span className={cn(monoLabel, "text-[10px] text-muted-foreground")}>Robux</span>
          </>
        ) : (
          <span className="text-xl leading-none font-semibold tracking-[-0.03em]">{item.label}</span>
        )}
      </span>

      <span aria-hidden className="relative hidden h-px bg-border sm:block">
        <span className="absolute inset-0 origin-left scale-x-0 bg-brand transition-transform duration-400 ease-out-expo group-hover:scale-x-100" />
        {best && (
          <span className={cn(monoLabel, "absolute -top-2.5 left-0 bg-foreground px-1.5 py-0.5 text-[9px] text-background")}>
            Paling hemat
          </span>
        )}
      </span>

      <span className="text-right">
        <PriceTag priced={priced} />
        <span className={cn(monoLabel, "mt-0.5 block text-[10px] normal-case text-muted-foreground sm:hidden")}>
          {rate ? `Rp ${num(Math.round(rate))}/Robux` : ""}
          {best ? " · paling hemat" : ""}
        </span>
      </span>

      <span className="hidden items-center gap-4 sm:flex">
        <span className={cn(monoLabel, "w-24 text-right text-[10px] normal-case text-muted-foreground tabular-nums")}>
          {rate ? `Rp ${num(Math.round(rate))}/Robux` : ""}
        </span>
        {soldOut ? (
          <span className={cn(monoLabel, "grid h-8 place-items-center border border-[var(--stock)] px-2 text-[10px] font-bold text-[var(--stock)]")}>Habis</span>
        ) : (
          <span className="grid size-8 place-items-center bg-surface-2 transition-colors duration-200 group-hover:bg-brand group-hover:text-brand-foreground">
            <Arrow />
          </span>
        )}
      </span>
    </Row>
  );
}
