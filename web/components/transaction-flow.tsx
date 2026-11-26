import { cn } from "@/lib/utils";

// Ilustrasi alur transaksi Joyco: Chat → Bayar → Verifikasi → Kirim → Nota.
//
// Semua mulai abu-abu. Paket biru berjalan di rel, dan apa pun yang sudah
// dilewatinya — rel, penanda ruas, kotak titik — menyala biru satu per satu.
// Di akhir putaran semuanya memudar kembali ke abu, lalu mulai lagi.
//
// Ketajaman: garis lurus adalah <rect> crispEdges (tumbuh lewat transform /
// atribut width, tanpa stroke yang di-scale) dan tepi kotak memakai
// vector-effect non-scaling-stroke. Semua timing memakai jam SMIL yang sama,
// jadi nyala tiap bagian selalu pas dengan posisi paket.

const CYCLE = 6.5; // detik per putaran
const TRAVEL = 0.78; // porsi putaran untuk perjalanan paket
const HOLD = 0.9; // semua tetap menyala sampai titik ini
const OUT = 0.96; // selesai memudar ke abu

const NODES = [
  { code: "01", title: "Chat", sub: "Order via WhatsApp", icon: "chat" },
  { code: "02", title: "Bayar", sub: "QRIS / transfer", icon: "pay" },
  { code: "03", title: "Verifikasi", sub: "Dicek admin", icon: "shield" },
  { code: "04", title: "Kirim", sub: "Robux masuk", icon: "robux" },
  { code: "05", title: "Nota", sub: "Bukti & histori", icon: "receipt" },
] as const;

const SEGMENTS = ["Mudah", "Aman", "Cepat", "Tercatat"];

type Icon = (typeof NODES)[number]["icon"];

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;
const crisp = { shapeRendering: "crispEdges" as const, vectorEffect: "non-scaling-stroke" as const };
const dur = `${CYCLE}s`;

/** Jadwal nyala untuk sesuatu yang dilewati paket pada porsi `f` putaran. */
function litAt(f: number) {
  if (f < 0.005) return { values: "1;1;0;0", keyTimes: `0;${HOLD};${OUT};1` };
  const on = Math.min(f + 0.015, HOLD - 0.01);
  return { values: "0;0;1;1;0;0", keyTimes: `0;${f.toFixed(3)};${on.toFixed(3)};${HOLD};${OUT};1` };
}

/** Grup yang muncul (opacity 0 → 1) saat paket tiba di porsi `f`. */
function Lit({ f, children }: { f: number; children: React.ReactNode }) {
  const s = litAt(f);
  return (
    <g opacity={f < 0.005 ? 1 : 0}>
      <animate attributeName="opacity" values={s.values} keyTimes={s.keyTimes} dur={dur} repeatCount="indefinite" />
      {children}
    </g>
  );
}

function NodeIcon({ icon }: { icon: Icon }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinejoin: "miter" as const,
    strokeLinecap: "square" as const,
    vectorEffect: "non-scaling-stroke" as const,
  };
  switch (icon) {
    case "chat":
      return (
        <g {...p}>
          <path d="M4 5h16v11H10l-6 4z" />
          <path d="M8 10.5h1M11.5 10.5h1M15 10.5h1" strokeWidth={2} />
        </g>
      );
    case "pay":
      return (
        <g {...p} shapeRendering="crispEdges">
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
          <path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM14 20h1M20 14v1" />
        </g>
      );
    case "shield":
      return (
        <g {...p}>
          <path d="M12 3l7 3v6c0 4.5-3 7.4-7 9-4-1.6-7-4.5-7-9V6z" />
          <path d="M8.8 12.2l2.2 2.2 4.2-4.4" />
        </g>
      );
    case "robux":
      return (
        <g {...p}>
          <path d="M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4z" />
          <circle cx="12" cy="12" r="3.4" />
        </g>
      );
    case "receipt":
      return (
        <g {...p}>
          <path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21z" />
          <path d="M9 8h6M9 11.5h6M9 15h3.5" shapeRendering="crispEdges" />
        </g>
      );
  }
}

/** Kotak titik: versi abu di bawah, versi biru di atas yang menyala saat paket tiba. */
function Node({ x, y, h, icon, index }: { x: number; y: number; h: number; icon: Icon; index: number }) {
  const f = (index / (NODES.length - 1)) * TRAVEL;
  const b = Math.round(h * 0.28);
  const s = (h * 0.76) / 24;
  const r = h + 7;
  const brackets = `M${-h} ${-h + b}V${-h}H${-h + b}M${h - b} ${-h}H${h}V${-h + b}M${h} ${h - b}V${h}H${h - b}M${-h + b} ${h}H${-h}V${h - b}`;
  const icn = <g transform={`translate(${-12 * s} ${-12 * s}) scale(${s})`}><NodeIcon icon={icon} /></g>;
  // Cincin denyut sesaat setelah paket tiba.
  const pulseOff = Math.min(f + 0.09, HOLD - 0.01);
  const pulseTimes = f < 0.005 ? `0;0.09;1` : `0;${f.toFixed(3)};${pulseOff.toFixed(3)};1`;

  return (
    <g className="tx-node" style={d(300 + index * 140)}>
      <g transform={`translate(${x} ${y})`}>
        {/* Abu (keadaan awal) */}
        <rect x={-h} y={-h} width={h * 2} height={h * 2} className="fill-surface stroke-border-strong" strokeWidth={1} {...crisp} />
        <path d={brackets} className="fill-none stroke-muted-foreground/50" strokeWidth={1.5} {...crisp} />
        <g className="text-muted-foreground">{icn}</g>

        {/* Biru (menyala saat dilewati) */}
        <Lit f={f}>
          <rect x={-h} y={-h} width={h * 2} height={h * 2} className="fill-brand/10 stroke-brand/60" strokeWidth={1} {...crisp} />
          <path d={brackets} className="fill-none stroke-brand" strokeWidth={1.5} {...crisp} />
          <g className="text-foreground">{icn}</g>
        </Lit>

        <rect x={-r} y={-r} width={r * 2} height={r * 2} className="fill-none stroke-brand" strokeWidth={1} opacity={0} {...crisp}>
          <animate attributeName="opacity" values={f < 0.005 ? "1;0;0" : "0;1;0;0"} keyTimes={pulseTimes} dur={dur} repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="scale" values={f < 0.005 ? "1;1.3;1.3" : "1;1;1.3;1.3"} keyTimes={pulseTimes} dur={dur} repeatCount="indefinite" />
        </rect>
      </g>
    </g>
  );
}

/** Rel abu + garis biru yang memanjang mengikuti paket + paketnya sendiri. */
function Rail({ x1, x2, start, end, y, size }: { x1: number; x2: number; start: number; end: number; y: number; size: number }) {
  const path = `M${start} ${y}H${end}`;
  const motion = { path, dur, repeatCount: "indefinite", keyPoints: "0;1;1", keyTimes: `0;${TRAVEL};1`, calcMode: "linear" as const };
  const fade = { attributeName: "opacity", values: "1;1;0;0", keyTimes: `0;${HOLD};${OUT};1`, dur, repeatCount: "indefinite" };

  return (
    <>
      <rect x={x1} y={y - 0.5} width={x2 - x1} height={1} className="tx-grow-x fill-border-strong" shapeRendering="crispEdges" style={d(150)} />
      <g shapeRendering="crispEdges">
        <rect x={start} y={y - 0.75} height={1.5} width={0} className="fill-brand">
          <animate attributeName="width" values={`0;${end - start};${end - start}`} keyTimes={`0;${TRAVEL};1`} dur={dur} repeatCount="indefinite" />
          <animate {...fade} />
        </rect>
        <g>
          <animate {...fade} />
          <rect x={-size} y={-size} width={size * 2} height={size * 2} className="fill-brand" opacity={0.22}>
            <animateMotion {...motion} />
          </rect>
          <rect x={-size / 2} y={-size / 2} width={size} height={size} className="fill-brand">
            <animateMotion {...motion} />
          </rect>
        </g>
      </g>
    </>
  );
}

const mono = "font-mono uppercase";

/** Versi lebar: lima titik berjajar, label ruas di atas, keterangan di bawah. */
function Wide() {
  const xs = NODES.map((_, i) => 120 + i * 240);
  const y = 130;
  const last = xs[xs.length - 1];

  return (
    <svg viewBox="0 0 1200 262" className="tx hidden w-full md:block" aria-hidden>
      <Rail x1={0} x2={1200} start={xs[0]} end={last} y={y} size={4} />

      {SEGMENTS.map((label, i) => {
        const mx = (xs[i] + xs[i + 1]) / 2;
        const f = ((i + 0.5) / (NODES.length - 1)) * TRAVEL;
        return (
          <g key={label}>
            <rect x={mx - 0.5} y={y - 58} width={1} height={58} className="tx-grow-y fill-border-strong" shapeRendering="crispEdges" style={d(900 + i * 120)} />
            <rect x={mx - 3} y={y - 3} width={6} height={6} className="fill-background stroke-muted-foreground/60" strokeWidth={1.5} {...crisp} />
            <text x={mx} y={y - 72} textAnchor="middle" className={cn(mono, "tx-node fill-muted-foreground text-[12px] tracking-[0.14em]")} style={d(1100 + i * 120)}>
              {label}
            </text>
            <Lit f={f}>
              <rect x={mx - 0.5} y={y - 58} width={1} height={58} className="fill-brand" shapeRendering="crispEdges" />
              <rect x={mx - 3} y={y - 3} width={6} height={6} className="fill-brand stroke-brand" strokeWidth={1.5} {...crisp} />
              <text x={mx} y={y - 72} textAnchor="middle" className={cn(mono, "fill-brand-text text-[12px] tracking-[0.14em]")}>
                {label}
              </text>
            </Lit>
          </g>
        );
      })}

      {NODES.map((n, i) => (
        <g key={n.code}>
          <Node x={xs[i]} y={y} h={36} icon={n.icon} index={i} />
          <g className="tx-node" style={d(450 + i * 140)}>
            <text x={xs[i]} y={y + 80} textAnchor="middle" className="fill-foreground font-sans text-[19px] font-semibold tracking-[-0.02em]">
              <tspan className="fill-brand-text font-mono text-[12px] font-normal">{n.code}</tspan> {n.title}
            </text>
            <text x={xs[i]} y={y + 104} textAnchor="middle" className={cn(mono, "fill-muted-foreground text-[11px] tracking-[0.06em]")}>
              {n.sub}
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
}

/** Versi HP: ringkas — ikon kecil + judul. */
function Compact() {
  const xs = NODES.map((_, i) => 36 + i * 72);
  const y = 34;

  return (
    <svg viewBox="0 0 360 90" className="tx block w-full md:hidden" aria-hidden>
      <Rail x1={0} x2={360} start={xs[0]} end={xs[xs.length - 1]} y={y} size={3} />
      {SEGMENTS.map((label, i) => {
        const mx = (xs[i] + xs[i + 1]) / 2;
        const f = ((i + 0.5) / (NODES.length - 1)) * TRAVEL;
        return (
          <g key={label}>
            <rect x={mx - 2} y={y - 2} width={4} height={4} className="fill-background stroke-muted-foreground/60" strokeWidth={1} {...crisp} />
            <Lit f={f}>
              <rect x={mx - 2} y={y - 2} width={4} height={4} className="fill-brand stroke-brand" strokeWidth={1} {...crisp} />
            </Lit>
          </g>
        );
      })}
      {NODES.map((n, i) => (
        <g key={n.code}>
          <Node x={xs[i]} y={y} h={20} icon={n.icon} index={i} />
          <text x={xs[i]} y={y + 46} textAnchor="middle" className="tx-node fill-foreground font-sans text-[11px] font-semibold tracking-[-0.01em]" style={d(450 + i * 140)}>
            {n.title}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function TransactionFlow({ className }: { className?: string }) {
  return (
    <figure data-reveal="fade" className={cn("relative", className)} aria-label="Alur transaksi: chat, bayar, verifikasi, kirim, nota">
      <Wide />
      <Compact />
    </figure>
  );
}
