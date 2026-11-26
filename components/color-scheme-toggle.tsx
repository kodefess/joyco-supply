"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "netnot:color-scheme";

// Dijalankan inline di <head> sebelum paint supaya tidak ada kilatan tema
// yang salah. Pilihan manual disimpan; tanpa itu ikut setelan sistem.
export const COLOR_SCHEME_SCRIPT = `(function(){try{var s=localStorage.getItem("${STORAGE_KEY}");var d=s!=="light";document.documentElement.dataset.theme=d?"dark":"light";var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=d?"#0b0b0b":"#f4f5f9"}catch(e){}})()`;

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};

const getScheme = () => document.documentElement.dataset.theme ?? "dark";

export function ColorSchemeToggle() {
  const scheme = useSyncExternalStore(subscribe, getScheme, () => "dark");
  const next = scheme === "dark" ? "light" : "dark";

  const toggle = () => {
    // Matikan semua transition sebentar: tanpa ini tiap elemen memudar ke
    // warna baru dengan kecepatan sendiri-sendiri dan tema terasa "belang".
    const freeze = document.createElement("style");
    freeze.textContent = "*,*::before,*::after{transition:none!important}";
    document.head.appendChild(freeze);
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#0b0b0b" : "#f4f5f9");
    // Paksa style dihitung dengan tema baru sebelum transition dihidupkan lagi.
    void window.getComputedStyle(document.body).color;
    requestAnimationFrame(() => freeze.remove());
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={next === "dark" ? "Mode gelap" : "Mode terang"}
      title={next === "dark" ? "Mode gelap" : "Mode terang"}
      className="press grid w-[3.25rem] shrink-0 cursor-pointer place-items-center bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground"
    >
      <Sun aria-hidden className="size-4 dark:hidden" />
      <Moon aria-hidden className="hidden size-4 dark:block" />
    </button>
  );
}
