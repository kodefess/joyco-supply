import { cn } from "@/lib/utils";

// Logo JOYCO digambar ulang sebagai vektor dari public/joyco.png supaya tetap
// tajam di ukuran berapa pun. Koordinat diambil dari bitmap 200×200 aslinya.

const MARK_PATHS = (
  <>
    <path d="M50 52h109v16H50z" />
    <path d="M108 68h34v53l-34 34H50V80h46v52h12z" />
  </>
);

/** Tanda saja (tanpa latar), mewarisi `currentColor`. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="50 52 109 103" aria-hidden className={cn("fill-current", className)}>
      {MARK_PATHS}
    </svg>
  );
}

/** Tile biru lengkap dengan simbol ©, sama seperti joyco.png. */
export function LogoTile({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden className={cn("block", className)}>
      <rect width="200" height="200" className="fill-brand" />
      <g className="fill-white">{MARK_PATHS}</g>
      <circle cx="135.5" cy="148" r="6.4" fill="none" stroke="#fff" strokeWidth="1.6" />
      <path d="M137.8 145.9a3 3 0 1 0 0 4.2" fill="none" stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}
