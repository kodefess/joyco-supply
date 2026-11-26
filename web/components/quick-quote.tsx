"use client";

import { useState } from "react";

import { PriceTag } from "@/components/price-tag";
import { Presets, RobuxInput } from "@/components/robux-input";
import { useSettings } from "@/components/settings-context";
import { Arrow, Corners, Kbd, monoLabel, primaryButton } from "@/components/ui";
import {
  TOPUP_TYPES,
  gamepassPriceFor,
  hasRobuxPricing,
  presetAmounts,
  quote,
  quoteProblem,
  type Category,
} from "@/lib/catalog";
import { orderLink } from "@/lib/settings";
import { cn, num } from "@/lib/utils";

/** Cek harga cepat di hero: pilih jenis, ketik atau pilih jumlah, harga langsung keluar. */
export function QuickQuote({ categories }: { categories: Category[] }) {
  const settings = useSettings();
  const { promo } = settings;
  const usable = categories.filter((c) => hasRobuxPricing(c) && !c.stock.soldOut);
  const [catId, setCatId] = useState(usable[0]?.id ?? "");
  const [robux, setRobux] = useState(1_000);
  const category = usable.find((c) => c.id === catId) ?? usable[0];
  if (!category) return null;

  const q = quote(category, robux, promo);
  const typeCount = (t: Category["type"]) => usable.filter((c) => c.type === t).length;

  return (
    <div className="flex flex-col gap-[2px]">
      <div className={cn(monoLabel, "flex h-9 items-center justify-between bg-surface-2 px-3 text-muted-foreground")}>
        <span className="flex items-center gap-2">
          <span className="block size-1.5 bg-brand" />
          Cek harga
        </span>
        {q && <Kbd>Rp {num(Math.round(q.rate))}/Robux</Kbd>}
      </div>

      <div
        role="radiogroup"
        aria-label="Jenis top up"
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${usable.length}, minmax(0,1fr))` }}
      >
        {usable.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={c.id === category.id}
            onClick={() => setCatId(c.id)}
            className={cn(
              monoLabel,
              "press relative h-10 truncate px-2",
              c.id === category.id ? "bg-surface-3 text-foreground" : "bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground",
            )}
          >
            {typeCount(c.type) > 1 ? c.name : TOPUP_TYPES[c.type].short}
            {c.id === category.id && <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] bg-brand" />}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-[2px] bg-surface p-3">
        <RobuxInput id="quick-robux" value={robux} onChange={setRobux} invalid={!q} />
        <Presets values={presetAmounts(category)} value={robux} onPick={setRobux} />
      </div>

      <div className="relative bg-background p-5">
        <Corners />
        <div className="flex items-start justify-between gap-4">
          <p className={cn(monoLabel, "text-muted-foreground")}>
            {q ? (q.basis === "paket" ? "Harga paket" : "Jumlah custom") : "Kamu bayar"}
          </p>
        </div>
        <div className="mt-2 min-h-[2.6rem] overflow-hidden">
          {q ? (
            <span key={`${category.id}-${q.robux}`} className="tick">
              <PriceTag priced={q} size="lg" align="left" />
            </span>
          ) : (
            <p className="text-[15px] text-muted-foreground">{quoteProblem(category, robux)}</p>
          )}
        </div>
        <dl className={cn(monoLabel, "mt-5 grid grid-cols-2 gap-y-2 text-muted-foreground")}>
          <dt>Jenis</dt>
          <dd className="truncate text-right text-foreground">{category.name}</dd>
          {category.type === "gamepass" && robux > 0 && (
            <>
              <dt>Set gamepass</dt>
              <dd className="text-right text-foreground tabular-nums">{num(gamepassPriceFor(robux))} Robux</dd>
            </>
          )}
          {category.eta && (
            <>
              <dt>Estimasi</dt>
              <dd className="text-right text-foreground">{category.eta}</dd>
            </>
          )}
        </dl>
      </div>

      <a
        href={q ? orderLink(settings, category, { robux }, q.price) : undefined}
        aria-disabled={!q}
        target="_blank"
        rel="noreferrer"
        className={cn(primaryButton, "h-12", !q && "pointer-events-none opacity-50")}
      >
        {q ? `Order ${num(robux)} Robux` : "Order"}
        <Arrow />
      </a>
    </div>
  );
}
