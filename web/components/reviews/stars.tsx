import { cn } from "@/lib/utils";

const STAR = "M12 1.8 15 8.2l7 .8-5.2 4.8 1.4 6.9L12 17.2l-6.2 3.5 1.4-6.9L2 9l7-.8z";

export function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("shrink-0", className)}>
      <path
        d={STAR}
        strokeLinejoin="miter"
        strokeWidth="1.6"
        className={cn(filled ? "fill-brand stroke-brand" : "fill-transparent stroke-border-strong")}
      />
    </svg>
  );
}

/** Rating tampilan (baca saja). */
export function Stars({ value, className, size = "size-3.5" }: { value: number; className?: string; size?: string }) {
  return (
    <span role="img" aria-label={`${value} dari 5 bintang`} className={cn("flex gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} filled={i < Math.round(value)} className={size} />
      ))}
    </span>
  );
}
