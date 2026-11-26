import { cn } from "@/lib/utils";

/**
 * Pita berjalan yang tenang: satu bobot huruf, ukuran sedang, pemisah kotak
 * kecil berwarna brand. Isi digandakan sekali supaya loop -50% mulus.
 * Gerak konstan → linear; berhenti saat di-hover (pointer presisi saja)
 * dan mati di prefers-reduced-motion.
 */
export function Marquee({
  items,
  speed = 60,
  reverse,
  className,
}: {
  items: string[];
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  const row = (hidden?: boolean) => (
    <div aria-hidden={hidden} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-8 text-[clamp(1.25rem,2.2vw,1.875rem)] leading-none font-medium tracking-[-0.03em] whitespace-nowrap text-foreground sm:px-12">
            {item}
          </span>
          <span aria-hidden className="block size-1.5 shrink-0 rotate-45 bg-brand" />
        </span>
      ))}
    </div>
  );

  return (
    <div className={cn("marquee overflow-clip border-y border-border bg-surface py-5 sm:py-6", className)}>
      <div
        className="marquee-track"
        style={{ "--speed": `${speed}s`, "--dir": reverse ? "reverse" : "normal" } as React.CSSProperties}
      >
        {row()}
        {row(true)}
      </div>
    </div>
  );
}
