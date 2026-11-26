import { monoLabel } from "@/components/ui";
import { cn } from "@/lib/utils";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

/** Pembuka halaman dalam: arena gelap, judul raksasa naik per baris, satu kalimat. */
export function PageIntro({
  code,
  label,
  lines,
  body,
  aside,
}: {
  code: string;
  label: string;
  lines: React.ReactNode[];
  body: string;
  aside?: React.ReactNode;
}) {
  return (
    <section className="arena relative overflow-clip px-4 pt-16 pb-12 sm:px-8 sm:pt-24 sm:pb-16">
      <div aria-hidden className="arena-floor">
        <i />
      </div>
      <p className={cn(monoLabel, "fade-in flex items-center gap-2 text-muted-foreground")}>
        <span className="block size-1.5 bg-brand" />
        <span className="text-foreground">{code}</span> / {label}
      </p>
      <h1 className="mt-8 text-[clamp(3rem,10vw,9rem)] leading-[0.86] font-bold tracking-[-0.065em] sm:mt-12">
        {lines.map((line, i) => (
          <span key={i} className="block overflow-hidden pb-[0.05em]">
            <span className="rise" style={d(120 + i * 110)}>
              {line}
            </span>
          </span>
        ))}
      </h1>
      <div className="mt-10 flex flex-wrap items-end justify-between gap-6 sm:mt-14">
        <p className="fade-in max-w-sm text-[17px] leading-snug text-muted-foreground" style={d(400)}>
          {body}
        </p>
        {aside && (
          <div className="fade-in" style={d(500)}>
            {aside}
          </div>
        )}
      </div>
    </section>
  );
}
