"use client";

import { useEffect } from "react";

const SELECTOR = "[data-reveal]:not([data-inview])";

/**
 * Satu IntersectionObserver untuk semua elemen `[data-reveal]`. Elemen baru
 * (pindah halaman, filter testimoni) ikut terpantau lewat MutationObserver,
 * jadi komponen server pun bisa beranimasi tanpa wrapper client.
 */
export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-inview", "");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );

    const scan = (root: ParentNode) => root.querySelectorAll(SELECTOR).forEach((el) => io.observe(el));
    // Observer ini ada di root layout dan bisa jalan sebelum segmen halaman
    // selesai hydrate; menandai elemen terlalu cepat = hydration mismatch.
    // Tunggu browser idle (setelah hydrate) baru mulai memantau.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 120));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(SELECTOR)) io.observe(node);
          scan(node);
        });
      }
    });
    const handle = idle(
      () => {
        scan(document);
        mo.observe(document.body, { childList: true, subtree: true });
      },
      { timeout: 400 },
    );

    return () => {
      cancelIdle(handle);
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
