"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ColorSchemeToggle } from "@/components/color-scheme-toggle";
import { LogoTile } from "@/components/logo";
import { useLenis } from "@/components/smooth-scroll";
import { Arrow, Diamond, Kbd, monoLabel, primaryButton } from "@/components/ui";
import { useScrollFrame } from "@/components/use-scroll-frame";
import { useSettings } from "@/components/settings-context";
import { DiscordGlyph } from "@/components/discord-link";
import { discordHref, generalLink } from "@/lib/settings";
import { NAV } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const lenis = useLenis();
  const settings = useSettings();
  const [open, setOpen] = useState(false);
  // Menu mobile mulai tepat di bawah header (bar promo bisa ada di atasnya).
  const [menuTop, setMenuTop] = useState(54);
  const header = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  const current = NAV.find((item) => item.href === pathname);

  // Garis progres baca di bawah header.
  useScrollFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    if (bar.current) bar.current.style.transform = `scaleX(${p})`;
  });

  // Menu mobile: kunci scroll selama terbuka, tutup dengan Esc.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis]);

  return (
    <>
      <header ref={header} data-sticky className="sticky top-0 z-50 flex h-[calc(3.25rem+2px)] gap-[2px] bg-background pb-[2px]">
        <Link href="/" aria-label={`${settings.brand}, beranda`} className="block w-[3.25rem] shrink-0 overflow-hidden">
          <LogoTile className="size-full" />
        </Link>

        <div className="flex min-w-0 flex-1 items-center gap-3 bg-surface-2 px-3 sm:px-4">
          <svg viewBox="0 0 16 16" aria-hidden className="size-3.5 shrink-0 fill-none stroke-muted-foreground stroke-[1.4]">
            <path d="M8 1.5 14 5v6l-6 3.5L2 11V5z" />
          </svg>
          <span className={cn(monoLabel, "flex min-w-0 flex-col leading-tight")}>
            <b className="font-medium text-foreground">{settings.brand}</b>
            <span className="truncate text-muted-foreground">Robux / {current?.label ?? "Halaman"}</span>
          </span>
          <span className={cn(monoLabel, "ml-auto hidden items-center gap-2 text-muted-foreground md:flex")}>
            <span className="blink block size-1.5 bg-success" />
            Admin
            {settings.hours && <Kbd>{settings.hours}</Kbd>}
          </span>
        </div>

        <nav aria-label="Utama" className="hidden gap-[2px] lg:flex">
          {NAV.map((item) => {
            const active = item.href === pathname;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  monoLabel,
                  "press relative flex items-center gap-2 px-4",
                  active
                    ? "bg-surface-3 text-foreground"
                    : "bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground",
                )}
              >
                <span className={active ? "text-brand-text" : undefined}>{item.code}</span>
                {item.label}
                {active && <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] bg-brand" />}
              </Link>
            );
          })}
        </nav>

        {discordHref(settings) && (
          <a
            href={discordHref(settings)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Discord ${settings.brand}`}
            title="Discord"
            className="press grid w-[3.25rem] shrink-0 place-items-center bg-surface-2 text-muted-foreground hover:bg-[#5865f2] hover:text-white"
          >
            <DiscordGlyph className="size-[18px]" />
          </a>
        )}
        <ColorSchemeToggle />

        <a
          href={generalLink(settings)}
          target="_blank"
          rel="noreferrer"
          className={cn(primaryButton, "hidden h-auto sm:inline-flex")}
        >
          Order
          <Arrow />
        </a>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => {
            setMenuTop(header.current?.getBoundingClientRect().bottom ?? 54);
            setOpen((v) => !v);
          }}
          className="press relative grid w-[3.25rem] shrink-0 place-items-center bg-surface-2 hover:bg-surface-3 lg:hidden"
        >
          <span
            className={cn(
              "absolute h-[1.5px] w-4 bg-foreground transition-transform duration-300 ease-out-expo",
              open ? "rotate-45" : "-translate-y-[3px]",
            )}
          />
          <span
            className={cn(
              "absolute h-[1.5px] w-4 bg-foreground transition-transform duration-300 ease-out-expo",
              open ? "-rotate-45" : "translate-y-[3px]",
            )}
          />
        </button>

        <span
          ref={bar}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-brand"
        />
      </header>

      <MobileMenu open={open} top={menuTop} pathname={pathname} onClose={() => setOpen(false)} />
    </>
  );
}

function MobileMenu({ open, top, pathname, onClose }: { open: boolean; top: number; pathname: string; onClose: () => void }) {
  const settings = useSettings();
  return (
    <div
      id="mobile-menu"
      data-lenis-prevent
      inert={!open}
      style={{ top }}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex flex-col gap-[2px] overflow-y-auto overscroll-contain bg-background pb-[env(safe-area-inset-bottom,0px)] transition-[clip-path] lg:hidden",
        open
          ? "duration-500 ease-[var(--ease-drawer)] [clip-path:inset(0_0_0_0)]"
          : "duration-300 ease-out-expo [clip-path:inset(0_0_100%_0)]",
      )}
    >
      {NAV.map((item, i) => {
        const active = item.href === pathname;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            aria-current={active ? "page" : undefined}
            className="press press-soft group flex items-end justify-between gap-4 overflow-hidden bg-surface px-4 pt-8 pb-4"
          >
            <span
              className={cn(
                "block text-[clamp(2.75rem,13vw,5rem)] leading-[0.9] font-semibold tracking-[-0.06em] transition-transform duration-600 ease-out-expo",
                open ? "translate-y-0" : "translate-y-full",
              )}
              style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms", transitionDuration: open ? undefined : "200ms" }}
            >
              {item.label}
            </span>
            <span className={cn(monoLabel, active ? "text-brand-text" : "text-muted-foreground")}>{item.code}</span>
          </Link>
        );
      })}
      <div className="flex flex-1 flex-col justify-end gap-[2px]">
        <div className={cn(monoLabel, "flex items-center justify-between bg-surface-2 px-4 py-3 text-muted-foreground")}>
          <span className="flex items-center gap-2">
            <span className="blink block size-1.5 bg-success" /> Admin
          </span>
          <span>{settings.hours}</span>
        </div>
        <a
          href={generalLink(settings)}
          target="_blank"
          rel="noreferrer"
          className={cn(primaryButton, "h-14 w-full")}
        >
          Order lewat WhatsApp
          <Arrow />
        </a>
        {discordHref(settings) && (
          <a
            href={discordHref(settings)}
            target="_blank"
            rel="noreferrer"
            className={cn(monoLabel, "press flex h-14 items-center justify-between gap-3 bg-[#5865f2] px-4 font-semibold text-white")}
          >
            <span className="flex items-center gap-3">
              <DiscordGlyph className="size-5" />
              Gabung Discord
            </span>
            <Arrow />
          </a>
        )}
        <div className={cn(monoLabel, "flex items-center gap-2 bg-surface-2 px-4 py-3 text-muted-foreground")}>
          <Diamond className="size-3" /> {settings.brand} · {settings.handle}
        </div>
      </div>
    </div>
  );
}
