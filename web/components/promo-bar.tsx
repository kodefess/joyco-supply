"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useSettings } from "@/components/settings-context";
import { monoLabel } from "@/components/ui";
import { promoActive } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

function format(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${d ? `${d}h ` : ""}${pad(h)}:${pad(m)}:${pad(s % 60)}`;
}

/** Bar promo di atas header, dengan hitung mundur bila ada batas waktu. */
export function PromoBar() {
  const { promo } = useSettings();
  const end = promo.endsAt ? Date.parse(promo.endsAt) : null;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    if (!end) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [end]);

  // Sebelum mount: ikut status server. Setelah mount: sembunyi bila habis.
  if (!promoActive(promo, now ?? 0)) return null;
  if (end && now !== null && end <= now) return null;

  return (
    <Link
      href="/katalog"
      className={cn(monoLabel, "group relative flex h-9 items-center gap-3 overflow-hidden bg-brand px-3 text-brand-foreground sm:px-4")}
    >
      <span className="flex shrink-0 items-center gap-1.5 bg-brand-foreground px-1.5 py-0.5 font-bold text-brand">
        <svg viewBox="0 0 10 10" aria-hidden className="size-2.5 fill-current">
          <path d="M5 0 6.2 3.8 10 5 6.2 6.2 5 10 3.8 6.2 0 5 3.8 3.8z" />
        </svg>
        {promo.label || "Promo"}
      </span>
      <span className="min-w-0 flex-1 truncate normal-case tracking-normal text-[13px] font-medium">
        {promo.message || (promo.percent ? `Diskon ${promo.percent}%` : "Promo sedang berjalan")}
      </span>
      {end && now !== null && (
        <span className="hidden shrink-0 items-center gap-2 sm:flex">
          Berakhir
          <span className="bg-black/25 px-1.5 py-0.5 font-bold tabular-nums">{format(end - now)}</span>
        </span>
      )}
      <span aria-hidden className="shrink-0 transition-transform duration-200 ease-out-expo group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}
