import { cn } from "@/lib/utils";

export type MascotPose = "wave" | "point" | "cheer" | "think" | "idle";

/*
 * Jojo — maskot JOYCO, gaya "chibi": badan bulat-kotak biru, layar wajah
 * besar dengan mata bulat berkilau, pipi merah muda, antena berujung
 * heksagon Robux.
 *
 * Anatomi dibuat supaya TIDAK PERNAH terlihat patah:
 * - Lengan = sarung tangan pendek yang berpangkal DI DALAM badan dan
 *   digambar di belakang badan, jadi sambungannya selalu tertutup badan
 *   pada sudut berapa pun.
 * - Titik putar lengan ada di dalam badan (bukan di tepi), sehingga lengan
 *   berayun seperti menempel di bahu.
 * - Semua bagian muat di viewBox; tidak ada yang menjulur keluar.
 *
 * Sudut lengan (derajat, searah jarum jam positif): lengan kanan menunjuk
 * ke kanan di 0°, lengan kiri ke kiri di 0°.
 */
const ARMS: Record<MascotPose, { l: number; r: number }> = {
  idle: { l: -50, r: 50 },
  wave: { l: -50, r: -50 },
  point: { l: -50, r: -4 },
  cheer: { l: 48, r: -48 },
  think: { l: -50, r: -18 },
};

/**
 * Gradien Jojo, dirender SEKALI di layout. Sengaja tidak di tiap <Mascot>:
 * id ganda bermasalah, dan Chrome tidak merender gradien dari SVG yang
 * display:none (mis. Jojo yang disembunyikan di tablet). Disembunyikan
 * dengan ukuran 0, bukan display:none.
 */
export function MascotDefs() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <linearGradient id="jojo-body" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#6b86ff" />
          <stop offset="0.55" stopColor="#2a4dff" />
          <stop offset="1" stopColor="#1530d6" />
        </linearGradient>
        <linearGradient id="jojo-limb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a5bff" />
          <stop offset="1" stopColor="#1a36d8" />
        </linearGradient>
        <linearGradient id="jojo-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#131a4a" />
          <stop offset="1" stopColor="#070b26" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Eyes({ pose }: { pose: MascotPose }) {
  if (pose === "cheer") {
    // Mata tertutup bahagia: ^ ^
    return (
      <g fill="none" stroke="#9fe9ff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M56 86 l8 -8 l8 8" />
        <path d="M88 86 l8 -8 l8 8" />
      </g>
    );
  }
  // Mata bulat berkilau. Saat berpikir, pupil melirik ke kanan atas.
  const look = pose === "think" ? { x: 2.5, y: -3 } : { x: 0, y: 0 };
  return (
    <g className="mascot-eyes">
      <ellipse cx="64" cy="84" rx="9" ry="11" fill="#9fe9ff" />
      <ellipse cx="96" cy="84" rx="9" ry="11" fill="#9fe9ff" />
      <g transform={`translate(${look.x} ${look.y})`}>
        <ellipse cx="64" cy="85" rx="5.5" ry="7" fill="#0a0f33" />
        <ellipse cx="96" cy="85" rx="5.5" ry="7" fill="#0a0f33" />
        <circle cx="66.5" cy="81.5" r="2.6" fill="#ffffff" />
        <circle cx="98.5" cy="81.5" r="2.6" fill="#ffffff" />
        <circle cx="62" cy="88" r="1.2" fill="#ffffff" fillOpacity="0.8" />
        <circle cx="94" cy="88" r="1.2" fill="#ffffff" fillOpacity="0.8" />
      </g>
    </g>
  );
}

function Mouth({ pose }: { pose: MascotPose }) {
  if (pose === "cheer") return <path d="M72 100 q8 10 16 0 z" fill="#ff8fb5" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />;
  if (pose === "think") return <path d="M76 103 h8" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />;
  return <path d="M74 100 q6 6 12 0" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />;
}

export function Mascot({ pose = "idle", className, flip }: { pose?: MascotPose; className?: string; flip?: boolean }) {
  const arms = ARMS[pose];
  return (
    <svg
      viewBox="0 0 160 170"
      aria-hidden
      data-pose={pose}
      className={cn("mascot", flip && "-scale-x-100", className)}
      style={{ "--arm-l": `${arms.l}deg`, "--arm-r": `${arms.r}deg` } as React.CSSProperties}
    >
      {/* Bayangan lantai tidak ikut mengambang */}
      <ellipse cx="80" cy="161" rx="36" ry="5" className="mascot-shadow" fill="#000" fillOpacity="0.22" />

      <g className="mascot-body">
        {/* Lengan & kaki digambar DI BELAKANG badan: pangkalnya selalu tertutup. */}
        <g className="mascot-arm-l">
          <rect x="12" y="93" width="36" height="16" rx="8" fill="url(#jojo-limb)" />
          <circle cx="18" cy="101" r="9" fill="#eef2ff" />
        </g>
        <g className="mascot-arm-r">
          <rect x="112" y="93" width="36" height="16" rx="8" fill="url(#jojo-limb)" />
          <circle cx="142" cy="101" r="9" fill="#eef2ff" />
        </g>
        <rect x="54" y="132" width="20" height="20" rx="9" fill="#1530d6" />
        <rect x="86" y="132" width="20" height="20" rx="9" fill="#1530d6" />

        {/* Antena + heksagon Robux */}
        <path d="M80 42 q0 -10 3 -18" fill="none" stroke="#1530d6" strokeWidth="5" strokeLinecap="round" />
        <g className="mascot-antenna">
          <polygon points="84,8 92.7,13 92.7,23 84,28 75.3,23 75.3,13" fill="#ffffff" stroke="#2a4dff" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="84" cy="18" r="3" fill="#2a4dff" />
        </g>

        {/* Badan */}
        <rect x="30" y="38" width="100" height="104" rx="40" fill="url(#jojo-body)" />
        <rect x="31" y="39" width="98" height="102" rx="39" fill="none" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" />
        <path d="M46 62 q6 -12 20 -14" fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="5" strokeLinecap="round" />

        {/* Layar wajah */}
        <rect x="42" y="60" width="76" height="56" rx="24" fill="url(#jojo-screen)" />
        <path d="M52 68 q10 -4 22 -4" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="4" strokeLinecap="round" />
        <Eyes pose={pose} />
        <ellipse cx="52" cy="102" rx="6.5" ry="4" fill="#ff7aa8" fillOpacity="0.9" />
        <ellipse cx="108" cy="102" rx="6.5" ry="4" fill="#ff7aa8" fillOpacity="0.9" />
        <Mouth pose={pose} />

        {/* Perut: lencana Robux kecil */}
        <polygon points="80,121 87,125 87,133 80,137 73,133 73,125" fill="#ffffff" fillOpacity="0.95" />
        <circle cx="80" cy="129" r="2.6" fill="#2a4dff" />

        {pose === "think" && (
          <text
            x="122"
            y="40"
            className="mascot-q"
            fontSize="26"
            fontWeight="800"
            fill="#2a4dff"
            stroke="#ffffff"
            strokeWidth="3"
            paintOrder="stroke"
            fontFamily="var(--font-public-sans), sans-serif"
          >
            ?
          </text>
        )}
      </g>
    </svg>
  );
}

/**
 * Jojo + gelembung bicara. Gelembung muncul saat masuk viewport
 * (data-reveal). `side` = posisi gelembung relatif ke maskot.
 */
export function MascotSpot({
  pose,
  say,
  side = "left",
  flip,
  className,
  mascotClassName,
}: {
  pose: MascotPose;
  say?: string;
  side?: "left" | "right" | "top";
  flip?: boolean;
  className?: string;
  mascotClassName?: string;
}) {
  return (
    <div className={cn("mascot-spot pointer-events-none relative inline-flex items-end", side === "top" && "flex-col items-center", className)}>
      {say && (
        <p
          data-reveal="up"
          style={{ "--d": "250ms" } as React.CSSProperties}
          className={cn(
            "mascot-bubble relative z-10 mb-[45%] shrink-0 bg-foreground px-3 py-2 font-mono text-[11px] font-bold tracking-[0.04em] whitespace-nowrap text-background uppercase",
            side === "left" && "order-first -mr-3",
            side === "right" && "order-last -ml-3",
            side === "top" && "order-first mb-2",
          )}
          data-side={side}
        >
          {say}
        </p>
      )}
      <Mascot pose={pose} flip={flip} className={cn("w-24 shrink-0 sm:w-28", mascotClassName)} />
    </div>
  );
}
