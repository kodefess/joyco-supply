"use client";

import { useState } from "react";

import { RobuxIcon, monoLabel } from "@/components/ui";
import { cn, num } from "@/lib/utils";

/** Input jumlah Robux: hanya angka, format ribuan saat tidak fokus. */
export function RobuxInput({
  id,
  value,
  onChange,
  label = "Jumlah Robux",
  invalid,
  className,
}: {
  id: string;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  invalid?: boolean;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={cn(monoLabel, "text-muted-foreground")}>
        {label}
      </label>
      <div className="flex gap-[2px]">
        <span className="grid h-12 w-12 shrink-0 place-items-center bg-surface-2 text-muted-foreground">
          <RobuxIcon className="size-4" />
        </span>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={value ? (focused ? String(value) : num(value)) : ""}
          placeholder="Ketik jumlah"
          aria-invalid={invalid || undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "").slice(0, 6)) || 0)}
          className={cn(
            "h-12 min-w-0 flex-1 bg-surface-2 px-3 text-2xl font-semibold tracking-[-0.03em] tabular-nums outline-none transition-shadow placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground/60",
            "focus:shadow-[inset_0_0_0_1.5px_var(--brand)] aria-invalid:shadow-[inset_0_0_0_1.5px_rgb(245_158_11)]",
          )}
        />
      </div>
    </div>
  );
}

/** Deretan tombol jumlah cepat. */
export function Presets({ values, value, onPick }: { values: number[]; value: number; onPick: (v: number) => void }) {
  return (
    <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0,1fr))` }}>
      {values.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onPick(v)}
          className={cn(
            monoLabel,
            "press h-10",
            v === value ? "bg-foreground text-background" : "bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground",
          )}
        >
          {num(v)}
        </button>
      ))}
    </div>
  );
}
