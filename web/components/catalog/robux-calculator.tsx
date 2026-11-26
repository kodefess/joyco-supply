"use client";

import { useState } from "react";

import { PriceTag } from "@/components/price-tag";
import { Presets, RobuxInput } from "@/components/robux-input";
import { useSettings } from "@/components/settings-context";
import { Arrow, Corners, Kbd, monoLabel, primaryButton } from "@/components/ui";
import { gamepassPriceFor, presetAmounts, quote, quoteProblem, type Category } from "@/lib/catalog";
import { orderLink } from "@/lib/settings";
import { clamp, cn, num, rupiah } from "@/lib/utils";

/** Kalkulator jumlah bebas untuk satu kategori di katalog. */
export function RobuxCalculator({ category }: { category: Category }) {
  const settings = useSettings();
  const { promo } = settings;
  const c = category.custom;
  const [robux, setRobux] = useState(() => clamp(1_000, c.min, c.max));
  const q = quote(category, robux, promo);
  const fill = ((clamp(robux, c.min, c.max) - c.min) / Math.max(1, c.max - c.min)) * 100;
  const fixed = c.price !== null && c.price > 0;
  const step = c.max - c.min > 2_000 ? 50 : 10;

  return (
    <div className="flex flex-col gap-[2px]">
      <div className={cn(monoLabel, "flex h-9 items-center justify-between bg-surface-2 px-3 text-muted-foreground")}>
        <span className="flex items-center gap-2">
          <span className="block size-1.5 bg-brand" />
          {category.items.length ? "Jumlah custom" : "Kalkulator"}
        </span>
        <Kbd>
          {fixed ? `${rupiah(c.price!)} / ${num(c.per)} Robux` : `ikut tarif paket · ${num(c.min)}–${num(c.max)}`}
        </Kbd>
      </div>

      <div className="grid grid-cols-1 gap-[2px] md:grid-cols-2">
        <div className="relative flex flex-col gap-3 bg-background p-5">
          <Corners />
          <RobuxInput id={`calc-${category.id}`} value={robux} onChange={setRobux} invalid={!q} label="Robux yang mau masuk" />
          <div>
            <input
              type="range"
              aria-label="Geser jumlah Robux"
              min={c.min}
              max={c.max}
              step={step}
              value={clamp(robux, c.min, c.max)}
              onChange={(e) => setRobux(Number(e.target.value))}
              className="range w-full"
              style={{ "--fill": `${fill}%` } as React.CSSProperties}
            />
            <div className={cn(monoLabel, "flex justify-between text-[10px] text-muted-foreground")}>
              <span>{num(c.min)}</span>
              <span>{num(c.max)}</span>
            </div>
          </div>
          <Presets values={presetAmounts(category)} value={robux} onPick={setRobux} />
        </div>

        <div className="flex flex-col justify-between gap-6 bg-surface p-5">
          <div>
            <p className={cn(monoLabel, "text-muted-foreground")}>
              {q ? (q.basis === "paket" ? "Harga paket" : "Kamu bayar") : "Kamu bayar"}
            </p>
            <div className="mt-2 min-h-[3.25rem] overflow-hidden">
              {q ? (
                <span key={q.robux} className="tick">
                  <PriceTag priced={q} size="xl" align="left" />
                </span>
              ) : (
                <p className="text-[15px] text-muted-foreground">{quoteProblem(category, robux)}</p>
              )}
            </div>
          </div>
          <dl className={cn(monoLabel, "grid grid-cols-2 gap-y-2 text-muted-foreground")}>
            {category.type === "gamepass" && robux > 0 && (
              <>
                <dt>Set gamepass ke</dt>
                <dd className="text-right font-bold text-brand-text tabular-nums">{num(gamepassPriceFor(robux))} Robux</dd>
              </>
            )}
            <dt>Masuk ke akun</dt>
            <dd className="text-right text-foreground tabular-nums">{num(robux)} Robux</dd>
            {q && (
              <>
                <dt>Tarif</dt>
                <dd className="text-right text-foreground normal-case tabular-nums">
                  Rp {num(Math.round(q.rate))}/Robux
                  {!fixed && q.basis === "custom" && (
                    <span className="text-muted-foreground"> · paket ≤ {num(robux)}</span>
                  )}
                </dd>
              </>
            )}
            <dt>Estimasi</dt>
            <dd className="text-right text-foreground">{category.eta || "—"}</dd>
          </dl>
        </div>
      </div>

      <a
        href={q ? orderLink(settings, category, { robux }, q.price) : undefined}
        aria-disabled={!q}
        target="_blank"
        rel="noreferrer"
        className={cn(primaryButton, "h-12", !q && "pointer-events-none opacity-50")}
      >
        {q ? `Order ${num(robux)} Robux · ${rupiah(q.price)}` : "Order"}
        <Arrow />
      </a>
    </div>
  );
}
