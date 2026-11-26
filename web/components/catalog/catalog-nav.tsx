"use client";

import { useRef } from "react";

import { contentTop, scrollToSection, stickyHeight } from "@/components/scroll-offset";
import { useLenis } from "@/components/smooth-scroll";
import { monoLabel } from "@/components/ui";
import { useScrollFrame } from "@/components/use-scroll-frame";
import { cn } from "@/lib/utils";

/**
 * Tab kategori yang menempel di bawah header; tab aktif mengikuti scroll.
 * Garis biru ada di dalam tiap tab (bukan satu garis yang diukur), jadi
 * lebarnya selalu pas dengan tab-nya.
 */
export function CatalogNav({ items }: { items: { id: string; label: string; code: string; soldOut?: boolean }[] }) {
  const lenis = useLenis();
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const activeRef = useRef(-1);

  useScrollFrame(() => {
    const line = stickyHeight() + 8;
    let active = 0;
    items.forEach((item, i) => {
      const el = document.getElementById(item.id);
      if (el && contentTop(el) <= line) active = i;
    });
    // Kategori terakhir mungkin tak pernah sampai ke atas layar.
    const root = document.documentElement;
    if (window.scrollY + window.innerHeight >= root.scrollHeight - 4) active = items.length - 1;
    if (active === activeRef.current) return;
    activeRef.current = active;

    links.current.forEach((a, i) => a?.toggleAttribute("data-active", i === active));
    // Jaga tab aktif tetap terlihat di layar sempit.
    const a = links.current[active];
    const scroller = a?.parentElement;
    if (a && scroller && (a.offsetLeft < scroller.scrollLeft || a.offsetLeft + a.offsetWidth > scroller.scrollLeft + scroller.clientWidth)) {
      scroller.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" });
    }
  });

  return (
    <nav data-sticky aria-label="Kategori" className="sticky top-[calc(3.25rem+2px)] z-30 bg-background pb-[2px]">
      <div className="flex gap-[2px] overflow-x-auto [scrollbar-width:none]">
        {items.map((item, i) => (
          <a
            key={item.id}
            ref={(el) => {
              links.current[i] = el;
            }}
            href={`#${item.id}`}
            onClick={(e) => {
              const el = document.getElementById(item.id);
              if (!lenis || !el) return;
              e.preventDefault();
              scrollToSection(lenis, el);
              history.replaceState(null, "", `#${item.id}`);
            }}
            className={cn(
              monoLabel,
              "group/tab relative flex h-11 shrink-0 items-center gap-2 bg-surface-2 px-4 whitespace-nowrap text-muted-foreground press hover:bg-surface-3 hover:text-foreground",
              "data-[active]:bg-surface-3 data-[active]:text-foreground",
            )}
          >
            <span className="text-brand-text">{item.code}</span>
            {item.label}
            {item.soldOut && (
              <span className="border border-[var(--stock)] px-1 text-[9px] font-bold text-[var(--stock)]" aria-label="stok habis">
                Habis
              </span>
            )}
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-brand transition-transform duration-300 ease-out-expo [[data-active]>&]:scale-x-100"
            />
          </a>
        ))}
        <span className="min-w-4 flex-1 bg-surface-2" />
      </div>
    </nav>
  );
}
