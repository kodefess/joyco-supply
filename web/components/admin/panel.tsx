"use client";

import { monoLabel } from "@/components/ui";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  meta,
  children,
  actions,
  className,
}: {
  title: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-[2px]", className)}>
      <header className="flex gap-[2px]">
        <h2 className={cn(monoLabel, "flex h-10 flex-1 items-center justify-between gap-3 bg-surface-2 px-3 text-muted-foreground")}>
          {title}
          {meta}
        </h2>
        {actions}
      </header>
      <div className="bg-surface p-5 sm:p-7">{children}</div>
    </section>
  );
}

export function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "press grid size-10 shrink-0 place-items-center bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground disabled:pointer-events-none disabled:opacity-35",
        danger && "hover:text-red-500",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Saklar on/off kotak ala JOYCO. */
export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="press press-soft flex w-full items-center gap-4 bg-surface-2 px-4 py-3.5 text-left hover:bg-surface-3"
    >
      <span className={cn("relative h-5 w-9 shrink-0 transition-colors duration-200", checked ? "bg-brand" : "bg-surface-3")}>
        <span
          className={cn(
            "absolute top-[3px] size-[14px] bg-white transition-transform duration-200 ease-out-expo",
            checked ? "translate-x-[19px]" : "translate-x-[3px]",
          )}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-medium">{label}</span>
        {description && <span className="block text-[13px] text-muted-foreground">{description}</span>}
      </span>
    </button>
  );
}
