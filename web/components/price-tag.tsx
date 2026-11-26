import type { Priced } from "@/lib/catalog";
import { cn, rupiah } from "@/lib/utils";

/** Label diskon berujung runcing, seperti label harga yang digunting. */
export function PromoBadge({ percent, label, className }: { percent?: number; label?: string; className?: string }) {
  const text = percent ? `−${percent}%` : label || "Promo";
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 bg-brand pr-1.5 pl-2.5 font-mono text-[10px] font-bold tracking-[0.04em] text-brand-foreground uppercase tabular-nums [clip-path:polygon(6px_0,100%_0,100%_100%,6px_100%,0_50%)]",
        className,
      )}
    >
      <svg viewBox="0 0 10 10" aria-hidden className="size-2 fill-current">
        <path d="M5 0 6.2 3.8 10 5 6.2 6.2 5 10 3.8 6.2 0 5 3.8 3.8z" />
      </svg>
      {text}
    </span>
  );
}

/** Harga lama dengan garis coret miring yang tergambar dari kiri. */
export function Struck({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("relative inline-block text-muted-foreground tabular-nums", className)}>
      {rupiah(value)}
      <span aria-hidden className="absolute inset-x-[-3px] top-1/2 h-[1.5px] -rotate-[9deg]">
        <span data-reveal="line" className="block size-full bg-brand" />
      </span>
      <span className="sr-only">(harga normal)</span>
    </span>
  );
}

/**
 * Harga dengan dukungan promo: harga baru menonjol, harga lama dicoret di
 * atasnya, plus badge diskon. Tanpa promo hanya harga biasa.
 */
export function PriceTag({
  priced,
  size = "md",
  align = "right",
  className,
}: {
  priced: Priced;
  size?: "md" | "lg" | "xl";
  align?: "left" | "right";
  className?: string;
}) {
  const main = {
    md: "text-lg tracking-[-0.03em]",
    lg: "text-[2.6rem] leading-none tracking-[-0.05em]",
    xl: "text-[clamp(2.5rem,5vw,3.25rem)] leading-none tracking-[-0.055em]",
  }[size];

  return (
    <span className={cn("inline-flex flex-col gap-1", align === "right" ? "items-end" : "items-start", className)}>
      {priced.original !== null && (
        <span className={cn("flex items-center gap-2", size === "md" ? "text-[12px]" : "text-sm")}>
          <Struck value={priced.original} />
          <PromoBadge percent={priced.percent} />
        </span>
      )}
      <span className={cn("block font-semibold tabular-nums", main, priced.original !== null && "text-brand-text")}>
        {rupiah(priced.price)}
      </span>
    </span>
  );
}
