import { cn } from "@/lib/utils";

/*
 * Wordmark raksasa bergaya lembar spesimen huruf / blueprint.
 *
 * Dua lapis:
 *   1. SVG — huruf + semua garis (metrik, penggaris, kisi, garis ukur,
 *      tanda registrasi). Garis memakai non-scaling-stroke: selalu 1px tajam.
 *   2. HTML di atasnya — SEMUA label teks, diposisikan dengan persen dari
 *      koordinat viewBox. Ukuran huruf label tetap (10–11px) di lebar layar
 *      berapa pun, jadi tidak pernah jadi semut di layar kecil atau raksasa
 *      di monitor lebar. Label hanya tampil dari lg ke atas; di bawahnya
 *      cukup garis yang bersih.
 *
 * Metrik diukur dari render nyata Public Sans 700 di 262 unit (textLength
 * 1000): tinggi kapital ≈ 192 unit (734/1000 em), tinggi-x ≈ 135 unit (515).
 */

const X0 = 80; // tepi kiri huruf
const W = 1000; // lebar huruf (textLength)
const X1 = X0 + W;
const CAP = 72; // garis kapital
const BASE = CAP + 192; // garis dasar
const XH = BASE - 135; // tinggi-x
const OVER = BASE + 6; // overshoot huruf bulat (O, C)
const DESC = BASE + 54; // garis turun
const VB_W = 1270;
const VB_H = 372;

/** Koordinat viewBox → persen untuk lapisan label HTML. */
const px = (x: number) => `${(x / VB_W) * 100}%`;
const py = (y: number) => `${(y / VB_H) * 100}%`;

// place: posisi label terhadap garisnya. Baseline & overshoot hanya terpisah
// 6 unit, jadi labelnya dibelah: satu di atas garis, satu di bawah.
const LINES = [
  { y: CAP, label: "Cap", value: "734", place: "center" },
  { y: XH, label: "X-height", value: "515", place: "center" },
  { y: BASE, label: "Baseline", value: "0", place: "above" },
  { y: OVER, label: "Overshoot", value: "−23", place: "below", dashed: true },
  { y: DESC, label: "Descender", value: "−206", place: "center" },
] as const;

const PLACE = { center: "-translate-y-1/2", above: "-translate-y-[calc(100%+3px)]", below: "translate-y-[3px]" };

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

/** Tanda registrasi: silang + lingkaran, seperti di lembar cetak. */
function RegMark({ x, y }: { x: number; y: number }) {
  return (
    <g className="wm-ink" fill="none">
      <circle cx={x} cy={y} r="6" vectorEffect="non-scaling-stroke" />
      <path d={`M${x - 11} ${y}H${x + 11}M${x} ${y - 11}V${y + 11}`} vectorEffect="non-scaling-stroke" />
    </g>
  );
}

const label = "font-mono text-[10px] leading-none tracking-[0.08em] uppercase whitespace-nowrap xl:text-[11px]";

export function Wordmark({ text, className }: { text: string; className?: string }) {
  const ticks = Array.from({ length: W / 25 + 1 }, (_, i) => i * 25);

  return (
    <div className={cn("wordmark relative", className)}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} role="img" aria-label={text} className="block w-full">
        {/* Kisi vertikal tiap 100 unit */}
        <g className="wm-grid">
          {Array.from({ length: W / 100 + 1 }, (_, i) => (
            <line key={i} x1={X0 + i * 100} x2={X0 + i * 100} y1={CAP - 22} y2={DESC + 10} vectorEffect="non-scaling-stroke" />
          ))}
        </g>

        {/* Penggaris atas */}
        <g className="wm-ink">
          <line x1={X0} x2={X1} y1={30} y2={30} vectorEffect="non-scaling-stroke" />
          {ticks.map((t) => (
            <line key={t} x1={X0 + t} x2={X0 + t} y1={30} y2={t % 100 === 0 ? 18 : t % 50 === 0 ? 23 : 26} vectorEffect="non-scaling-stroke" />
          ))}
        </g>

        {/* Garis metrik huruf, digambar berurutan saat masuk layar */}
        {LINES.map((l, i) => (
          <line
            key={l.label}
            x1={20}
            x2={X1 + 16}
            y1={l.y}
            y2={l.y}
            pathLength={1}
            data-reveal="draw"
            style={d(i * 140)}
            className={cn("wm-metric", "dashed" in l && "wm-dashed")}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Garis ukur lebar (atas) dan tinggi (kiri) */}
        <g className="wm-ink" fill="none">
          <path
            d={`M${X0} 46H${X1}M${X0} 40V52M${X1} 40V52M${X0 + 10} 41L${X0} 46L${X0 + 10} 51M${X1 - 10} 41L${X1} 46L${X1 - 10} 51`}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={`M44 ${CAP}V${BASE}M38 ${CAP}H50M38 ${BASE}H50M39 ${CAP + 10}L44 ${CAP}L49 ${CAP + 10}M39 ${BASE - 10}L44 ${BASE}L49 ${BASE - 10}`}
            vectorEffect="non-scaling-stroke"
          />
        </g>

        {/* Huruf */}
        <g data-reveal="up" style={d(250)}>
          <text
            x={X0}
            y={BASE}
            textLength={W}
            lengthAdjust="spacingAndGlyphs"
            className="wm-word font-sans"
            style={{ fontSize: 262, fontWeight: 700, letterSpacing: "-0.04em" }}
          >
            {text.toUpperCase()}
          </text>
        </g>

        {/* Tanda registrasi di sudut kotak huruf */}
        <RegMark x={X0} y={CAP} />
        <RegMark x={X1} y={CAP} />
        <RegMark x={X0} y={BASE} />
        <RegMark x={X1} y={BASE} />
      </svg>

      {/* Lapisan label: ukuran tetap, posisi persen dari viewBox. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden text-brand-text lg:block">
        {/* Angka penggaris */}
        {ticks
          .filter((t) => t % 200 === 0)
          .map((t) => (
            <span key={t} className={cn(label, "absolute -translate-y-full pl-1")} style={{ left: px(X0 + t), top: py(17) }}>
              {t}
            </span>
          ))}

        {/* Label garis metrik, kolom kanan */}
        {LINES.map((l) => (
          <span key={l.label} className={cn(label, "absolute flex gap-2", PLACE[l.place])} style={{ left: px(X1 + 26), top: py(l.y) }}>
            {l.label}
            <span className="text-muted-foreground">{l.value}</span>
          </span>
        ))}

        {/* Dimensi */}
        <span className={cn(label, "absolute -translate-x-1/2 -translate-y-1/2 bg-surface px-2")} style={{ left: px(X0 + W / 2), top: py(46) }}>
          W 1000
        </span>
        <span
          className={cn(label, "absolute -translate-x-1/2 -translate-y-1/2 -rotate-90 bg-surface px-2")}
          style={{ left: px(44), top: py((CAP + BASE) / 2) }}
        >
          H 734
        </span>

        {/* Anotasi spesimen */}
        <span className={cn(label, "absolute")} style={{ left: px(X0), top: py(DESC + 18) }}>
          Public Sans · Bold 700 · 262 pt
        </span>
        <span className={cn(label, "absolute -translate-x-1/2")} style={{ left: px(X0 + W / 2), top: py(DESC + 18) }}>
          Tracking −40 · UPM 1000
        </span>
        <span className={cn(label, "absolute -translate-x-full")} style={{ left: px(X1), top: py(DESC + 18) }}>
          Scale 1:1 · {text} / type spec
        </span>
      </div>
    </div>
  );
}
