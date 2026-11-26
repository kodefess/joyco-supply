import { cn } from "@/lib/utils";

// Bahasa komponen JOYCO Hub — sama dengan studio nota (netnot):
// blok kotak bercelah 2px, label Roboto Mono kapital, satu aksen biru.

/** Label mono kecil kapital. */
export const monoLabel = "font-mono text-[11px] uppercase tracking-[0.06em]";

/** Tombol segmen sekunder. */
export const segButton = cn(
  monoLabel,
  "press group/btn inline-flex h-11 shrink-0 items-center gap-2 bg-surface-2 px-4 text-muted-foreground hover:bg-surface-3 hover:text-foreground",
);

/** Tombol utama biru. Panah di dalamnya bergeser saat hover. */
export const primaryButton = cn(
  monoLabel,
  "group/btn relative inline-flex h-11 shrink-0 items-center justify-between gap-6 overflow-hidden bg-brand px-4 font-semibold text-brand-foreground hover:brightness-115",
  "press",
);

/** Badge gelap kecil, seperti angka di header kartu JOYCO Hub. */
export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "shrink-0 bg-background px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-normal text-foreground normal-case tabular-nums",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Bracket sudut biru — detail khas panel JOYCO. `hover` = muncul saat group di-hover. */
export function Corners({ hover, className }: { hover?: boolean; className?: string }) {
  const base = "pointer-events-none absolute size-2.5 border-brand";
  return (
    <span aria-hidden className={cn("corners", className)} data-hover={hover ? "" : undefined}>
      <i className={cn(base, "top-1.5 left-1.5 border-t-[1.5px] border-l-[1.5px]")} />
      <i className={cn(base, "top-1.5 right-1.5 border-t-[1.5px] border-r-[1.5px]")} />
      <i className={cn(base, "bottom-1.5 left-1.5 border-b-[1.5px] border-l-[1.5px]")} />
      <i className={cn(base, "right-1.5 bottom-1.5 border-r-[1.5px] border-b-[1.5px]")} />
    </span>
  );
}

/** Ikon wajik empat petak, seperti di pojok JOYCO Hub. */
export function Diamond({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={cn("size-4 shrink-0 rotate-45", className)}>
      <rect x="4" y="4" width="4" height="4" className="fill-foreground" />
      <rect x="8" y="8" width="4" height="4" className="fill-brand" />
      <rect x="8" y="4" width="4" height="4" className="fill-surface-3" />
      <rect x="4" y="8" width="4" height="4" className="fill-surface-3" />
    </svg>
  );
}

/** Panah yang meluncur keluar-masuk saat tombol di-hover. */
export function Arrow({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("relative block size-3.5 overflow-hidden", className)}>
      <svg
        viewBox="0 0 14 14"
        className="absolute inset-0 size-full fill-none stroke-current stroke-[1.5] transition-transform duration-300 ease-out-expo group-hover/btn:translate-x-full group-hover:translate-x-full"
      >
        <path d="M1 7h11M7.5 2.5 12 7l-4.5 4.5" />
      </svg>
      <svg
        viewBox="0 0 14 14"
        className="absolute inset-0 size-full -translate-x-full fill-none stroke-current stroke-[1.5] transition-transform duration-300 ease-out-expo group-hover/btn:translate-x-0 group-hover:translate-x-0"
      >
        <path d="M1 7h11M7.5 2.5 12 7l-4.5 4.5" />
      </svg>
    </span>
  );
}

/** Garis rambut yang menggambar dari kiri saat masuk viewport. */
export function Rule({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <span
      aria-hidden
      data-reveal="line"
      style={{ "--d": `${delay}ms` } as React.CSSProperties}
      className={cn("block h-px w-full bg-border-strong", className)}
    />
  );
}

/** Kepala section: kode mono + garis + label kanan. */
export function SectionHead({
  code,
  label,
  aside,
  className,
}: {
  code: string;
  label: string;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className={cn(monoLabel, "flex items-center justify-between gap-4 text-muted-foreground")}>
        <span className="flex items-center gap-2">
          <span className="block size-1.5 bg-brand" />
          <span className="text-foreground">{code}</span>
          <span>/</span>
          <span>{label}</span>
        </span>
        {aside}
      </div>
      <Rule />
    </div>
  );
}

/** Judul besar yang naik dari balik masker, per baris. */
export function MaskHeading({
  lines,
  as: Tag = "h2",
  className,
  delay = 0,
}: {
  lines: React.ReactNode[];
  as?: "h1" | "h2" | "h3";
  className?: string;
  delay?: number;
}) {
  return (
    <Tag className={cn("font-semibold tracking-[-0.05em] text-balance", className)}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <span
            data-reveal="mask"
            style={{ "--d": `${delay + i * 90}ms` } as React.CSSProperties}
            className="block"
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** Simbol Robux ala price list (⏣): heksagon + lingkaran, digambar vektor supaya tajam. */
export function RobuxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-label="Robux" role="img" className={cn("inline-block size-3.5 shrink-0 fill-none stroke-current", className)}>
      <path d="M8 1.2 13.9 4.6v6.8L8 14.8 2.1 11.4V4.6z" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2.6" strokeWidth="1.4" />
    </svg>
  );
}
