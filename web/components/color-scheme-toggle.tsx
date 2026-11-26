"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

const STORAGE_KEY = "joycomart:color-scheme";

// Dijalankan inline di <head> sebelum paint supaya tidak ada kilatan tema.
export const COLOR_SCHEME_SCRIPT = `(function(){try{var s=localStorage.getItem("${STORAGE_KEY}");var d=s!=="light";document.documentElement.dataset.theme=d?"dark":"light";var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=d?"#0b0b0b":"#f4f5f9"}catch(e){}})()`;

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};

const getScheme = () => document.documentElement.dataset.theme ?? "dark";

export function ColorSchemeToggle({ className }: { className?: string }) {
  const scheme = useSyncExternalStore(subscribe, getScheme, () => "dark");
  const next = scheme === "dark" ? "light" : "dark";

  const toggle = () => {
    // Matikan transisi warna selama satu frame supaya seluruh halaman berganti
    // serentak, bukan "mengalir" dengan durasi berbeda di tiap elemen.
    const root = document.documentElement;
    root.classList.add("theme-switching");
    root.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#0b0b0b" : "#f4f5f9");
    // Paksa style dihitung dulu dengan transisi mati, baru nyalakan lagi.
    void window.getComputedStyle(root).opacity;
    setTimeout(() => root.classList.remove("theme-switching"), 1);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Ganti ke mode ${next === "dark" ? "gelap" : "terang"}`}
      title={`Mode ${next === "dark" ? "gelap" : "terang"}`}
      className={cn(
        "press grid w-[3.25rem] shrink-0 place-items-center bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground",
        className,
      )}
    >
      {/* Dua ikon bertumpuk; ikon yang aktif masuk dengan blur + scale. */}
      <span className="theme-icon col-start-1 row-start-1 grid size-4 place-items-center transition-[opacity,scale,filter] duration-200 ease-out-expo dark:scale-75 dark:opacity-0 dark:blur-[2px]">
        <Sun className="size-4" />
      </span>
      <span className="theme-icon col-start-1 row-start-1 grid size-4 scale-75 place-items-center opacity-0 blur-[2px] transition-[opacity,scale,filter] duration-200 ease-out-expo dark:scale-100 dark:opacity-100 dark:blur-none">
        <Moon className="size-4" />
      </span>
    </button>
  );
}
