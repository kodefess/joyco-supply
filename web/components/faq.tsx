import { monoLabel } from "@/components/ui";
import { FAQ } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Accordion native <details>: bisa dibuka tanpa JS, tinggi beranimasi di Chromium. */
export function Faq() {
  return (
    <div className="flex flex-col gap-[2px]">
      {FAQ.map((item, i) => (
        <details
          key={item.q}
          name="faq"
          data-reveal="up"
          style={{ "--d": `${i * 60}ms` } as React.CSSProperties}
          className="faq group bg-surface"
        >
          <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-5 press press-soft hover:bg-surface-2 sm:px-6">
            <span className={cn(monoLabel, "w-6 text-brand-text")}>{String(i + 1).padStart(2, "0")}</span>
            <span className="flex-1 text-lg font-medium tracking-[-0.02em] sm:text-xl">{item.q}</span>
            <span aria-hidden className="relative grid size-8 shrink-0 place-items-center bg-surface-2">
              <span className="absolute h-[1.5px] w-3 bg-foreground" />
              <span className="plus-v absolute h-3 w-[1.5px] bg-foreground" />
            </span>
          </summary>
          <p className="max-w-2xl px-4 pb-6 pl-14 text-[15px] leading-relaxed text-muted-foreground sm:px-6 sm:pl-16">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
