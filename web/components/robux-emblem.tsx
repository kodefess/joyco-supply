import { cn } from "@/lib/utils";

// Heksagon Robux, sudut atas runcing. Titik dihitung sekali untuk r = 1.
const hex = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

const SPARKLES = [
  { x: 64, y: 92, s: 10, d: 0 },
  { x: 330, y: 70, s: 14, d: 700 },
  { x: 350, y: 300, s: 9, d: 1400 },
  { x: 48, y: 290, s: 12, d: 2000 },
  { x: 200, y: 22, s: 8, d: 1100 },
];

/**
 * Emblem Robux "loot" untuk hero: heksagon tebal berlapis (kesan 3D),
 * dua cincin orbit berputar, kilau yang menyapu, dan bintang berkedip.
 * Murni SVG + CSS (compositor), jadi tetap mulus saat halaman sibuk.
 */
export function RobuxEmblem({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("emblem relative aspect-square", className)}>
      <svg viewBox="0 0 400 400" className="size-full overflow-visible">
        <defs>
          <linearGradient id="em-face" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5c76ff" />
            <stop offset="0.55" stopColor="#1337ff" />
            <stop offset="1" stopColor="#0a1fa8" />
          </linearGradient>
          <linearGradient id="em-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1a80" />
            <stop offset="1" stopColor="#050c40" />
          </linearGradient>
          <linearGradient id="em-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="em-glow">
            <stop offset="0" stopColor="#1337ff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#1337ff" stopOpacity="0" />
          </radialGradient>
          <clipPath id="em-clip">
            <polygon points={hex(200, 190, 112)} />
          </clipPath>
        </defs>

        <circle cx="200" cy="200" r="200" fill="url(#em-glow)" />

        {/* Cincin orbit */}
        <g className="emblem-ring">
          <circle cx="200" cy="200" r="172" fill="none" stroke="#8a9cff" strokeOpacity="0.35" strokeDasharray="2 10" />
          <rect x="196" y="24" width="8" height="8" fill="#8a9cff" />
        </g>
        <g className="emblem-ring" data-rev="">
          <circle cx="200" cy="200" r="146" fill="none" stroke="#8a9cff" strokeOpacity="0.2" />
          <rect x="342" y="196" width="6" height="6" fill="#fff" />
          <rect x="52" y="196" width="6" height="6" fill="#1337ff" />
        </g>

        {/* Badan tebal: lapisan bawah digeser turun = sisi samping */}
        <polygon points={hex(200, 212, 112)} fill="url(#em-side)" />
        <polygon points={hex(200, 190, 112)} fill="url(#em-face)" />
        <polygon points={hex(200, 190, 112)} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
        <polygon points={hex(200, 190, 84)} fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="14" strokeLinejoin="round" />
        <circle cx="200" cy="190" r="30" fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="14" />

        {/* Kilau menyapu, dipotong sesuai bentuk muka */}
        <g clipPath="url(#em-clip)">
          <rect className="emblem-sheen" x="88" y="60" width="120" height="260" fill="url(#em-sheen)" transform="skewX(-18)" />
        </g>

        {SPARKLES.map((p) => (
          <path
            key={`${p.x}-${p.y}`}
            className="sparkle"
            style={{ "--d": `${p.d}ms` } as React.CSSProperties}
            d={`M${p.x} ${p.y - p.s} L${p.x + p.s * 0.28} ${p.y - p.s * 0.28} L${p.x + p.s} ${p.y} L${p.x + p.s * 0.28} ${p.y + p.s * 0.28} L${p.x} ${p.y + p.s} L${p.x - p.s * 0.28} ${p.y + p.s * 0.28} L${p.x - p.s} ${p.y} L${p.x - p.s * 0.28} ${p.y - p.s * 0.28}Z`}
            fill="#fff"
          />
        ))}
      </svg>
    </div>
  );
}
