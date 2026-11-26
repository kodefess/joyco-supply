import { monoLabel } from "@/components/ui";
import { STEPS } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Cara order dalam satu baris: empat kotak, nomor besar, satu kalimat.
 * Dibaca sekilas, bukan digulir. Garis biru di atas tiap kotak menggambar
 * berurutan saat masuk viewport.
 */
export function StepsTrack() {
  return (
    <ol className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((step, i) => (
        <li
          key={step.title}
          data-reveal="up"
          style={{ "--d": `${[0, 60, 100, 130][i]}ms` } as React.CSSProperties}
          className="relative grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 border border-border bg-surface p-6 sm:flex sm:flex-col sm:p-8"
        >
          <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-border">
            <span data-reveal="line" style={{ "--d": `${200 + i * 120}ms` } as React.CSSProperties} className="absolute inset-0 bg-brand" />
          </span>
          <span className={cn(monoLabel, "row-span-2 text-brand-text")}>
            <span className="sm:hidden">{String(i + 1).padStart(2, "0")}</span>
            <span className="hidden sm:inline">Step {String(i + 1).padStart(2, "0")}</span>
          </span>
          <span className="text-[1.75rem] leading-none font-bold tracking-[-0.05em] sm:mt-16 sm:text-[clamp(2.25rem,4vw,3.25rem)] sm:tracking-[-0.06em]">
            {step.title}
          </span>
          <span className="col-start-2 mt-2 text-[15px] leading-snug text-muted-foreground sm:mt-3">{step.body}</span>
        </li>
      ))}
    </ol>
  );
}
