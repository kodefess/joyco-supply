"use client";

import { useState } from "react";

import { monoLabel } from "@/components/ui";
import { cn, num } from "@/lib/utils";

export const controlClass =
  "h-10 w-full min-w-0 bg-surface-2 px-3 text-[15px] outline-none transition-[background-color,box-shadow] placeholder:text-muted-foreground/60 hover:bg-surface-3 focus:bg-surface-2 focus:shadow-[inset_0_0_0_1.5px_var(--brand)]";

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className={cn(monoLabel, "flex justify-between gap-2 text-muted-foreground")}>
        {label}
        {hint && <span className="normal-case tracking-normal opacity-70">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

/**
 * Angka dengan pemisah ribuan. Saat fokus tampil angka mentah (kursor aman),
 * saat blur diformat "17.000".
 */
export function NumberInput({
  value,
  onChange,
  prefix,
  placeholder,
  className,
  id,
  allowEmpty,
  ariaLabel,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  prefix?: React.ReactNode;
  placeholder?: string;
  className?: string;
  id?: string;
  allowEmpty?: boolean;
  ariaLabel?: string;
}) {
  const [focused, setFocused] = useState(false);
  const shown = value === null ? "" : focused ? String(value) : num(value);

  return (
    <div className={cn("flex min-w-0", className)}>
      {prefix && (
        <span className="grid shrink-0 place-items-center bg-surface-2 pl-3 font-mono text-[12px] text-muted-foreground">{prefix}</span>
      )}
      <input
        id={id}
        aria-label={ariaLabel}
        inputMode="numeric"
        value={shown}
        placeholder={placeholder}
        onFocus={(e) => {
          setFocused(true);
          requestAnimationFrame(() => e.target.select());
        }}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
          onChange(digits === "" ? (allowEmpty ? null : 0) : Number(digits));
        }}
        className={cn(controlClass, "tabular-nums", prefix && "pl-2")}
      />
    </div>
  );
}

/** Pilihan bersegmen (radio). */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  className,
}: {
  value: T;
  options: { value: T; label: string; code?: string }[];
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("grid gap-[2px]", className)} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              monoLabel,
              "press relative flex h-10 items-center justify-center gap-1.5 px-2",
              active ? "bg-foreground text-background" : "bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground",
            )}
          >
            {o.code && <span className={active ? "opacity-60" : "text-brand-text"}>{o.code}</span>}
            <span className="truncate">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
