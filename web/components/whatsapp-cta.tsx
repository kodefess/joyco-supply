"use client";

import { useEffect, useState } from "react";

import { useSettings } from "@/components/settings-context";
import { monoLabel } from "@/components/ui";
import { generalLink } from "@/lib/settings";
import { cn } from "@/lib/utils";

/** Glyph WhatsApp (gelembung + gagang telepon), satu path supaya tajam di ukuran kecil. */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("fill-current", className)}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm.01 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.23 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

/**
 * Tombol WhatsApp melayang di semua halaman situs.
 * - Muncul sekali (fade + scale dari 0.9, bukan dari 0).
 * - Sembunyi saat CTA WhatsApp di footer terlihat, supaya tidak ada dua tombol sama.
 * - Label "Chat admin" hanya di layar lebar; di HP cukup ikon 56px (target sentuh besar).
 * - Menjauh dari home indicator iPhone lewat safe-area inset.
 */
export function WhatsAppCta() {
  const settings = useSettings();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.querySelector("[data-wa-cta]");
    if (!target) return;
    const io = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), { rootMargin: "0px 0px -10% 0px" });
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <a
      href={generalLink(settings)}
      target="_blank"
      rel="noreferrer"
      aria-label={`Chat admin ${settings.brand} di WhatsApp`}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      data-hidden={hidden || undefined}
      className={cn(
        "wa-cta press group fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex h-14 items-center gap-3 bg-[#25d366] pr-4 pl-4 text-[#0b2e1a] shadow-[0_10px_30px_-8px_rgb(37_211_102/0.6),0_2px_6px_rgb(0_0_0/0.15)] sm:pr-5",
      )}
    >
      <span className="relative grid size-6 place-items-center">
        <WhatsAppGlyph className="size-6" />
        <span aria-hidden className="absolute -top-1 -right-1 block size-2.5 border-2 border-[#25d366] bg-[#0b2e1a]" />
      </span>
      <span className={cn(monoLabel, "hidden font-bold sm:inline")}>Chat admin</span>
    </a>
  );
}
