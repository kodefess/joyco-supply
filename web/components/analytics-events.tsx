"use client";

import { track } from "@vercel/analytics";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Event kustom Vercel Analytics tanpa menyentuh tiap tombol:
 * semua klik ke WhatsApp tercatat sebagai "order_click", lengkap dengan
 * halaman dan teks tombolnya. Di dev, track() hanya log ke console.
 */
export function AnalyticsEvents() {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      const href = a.href;
      if (href.startsWith("https://wa.me/")) {
        const text = new URL(href).searchParams.get("text") ?? "";
        track("order_click", {
          page: pathname,
          button: (a.innerText || a.getAttribute("aria-label") || "").trim().slice(0, 60),
          item: text.match(/order (.+?)\s*\(/)?.[1]?.slice(0, 80) ?? "umum",
        });
      } else if (a.host !== window.location.host && /^https?:/.test(href)) {
        track("outbound_click", { page: pathname, host: a.host });
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [pathname]);

  return null;
}
