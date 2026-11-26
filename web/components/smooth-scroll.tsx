"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import { scrollToSection } from "@/components/scroll-offset";

const LenisContext = createContext<Lenis | null>(null);

/** Instance Lenis aktif, atau null (reduced motion / sebelum mount). */
export const useLenis = () => useContext(LenisContext);

/**
 * Smooth scroll satu instance untuk seluruh situs.
 *
 * Pencegah "scroll macet":
 * - Lenis menggerakkan scroll native window, jadi sticky, IntersectionObserver
 *   dan event `scroll` tetap jalan normal.
 * - Touch memakai scroll native (syncTouch: false) — tidak ada inertia ganda.
 * - Scroll bersarang (daftar pilihan, tab geser) ditangani allowNestedScroll.
 * - Inertia dihentikan saat klik link internal, dan posisi di-reset instan
 *   ke atas setiap pindah halaman.
 * - Ukuran konten dipantau otomatis (autoResize), jadi accordion/filter yang
 *   mengubah tinggi halaman tidak membuat batas scroll basi.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({
      lerp: 0.11,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1,
      autoRaf: true,
      autoResize: true,
      // Anchor diurus sendiri (scroll-offset.ts): offset dihitung dari tinggi
      // header & bar sticky yang sebenarnya, bukan angka tetap.
      anchors: false,
      stopInertiaOnNavigate: true,
      // Elemen dengan scroll vertikal sendiri (mis. daftar pilihan) di-scroll
      // duluan, lalu berlanjut ke halaman — tanpa data-lenis-prevent, karena
      // atribut itu memberi overscroll-behavior: contain yang memutus rantai
      // scroll dan bikin halaman "macet" saat kursor ada di atasnya.
      allowNestedScroll: true,
    });
    setLenis(instance);

    return () => {
      instance.destroy();
      setLenis(null);
    };
  }, []);

  // Pindah halaman: lompat ke #hash bila ada (mis. /katalog#komunitas),
  // selain itu kembali ke atas. Saat pertama dimuat hanya hash yang diurus,
  // supaya posisi scroll yang dipulihkan browser tidak ditimpa.
  useEffect(() => {
    if (!lenis) return;
    const jumpToHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const el = id ? document.getElementById(id) : null;
      if (el) scrollToSection(lenis, el, true);
      return Boolean(el);
    };

    if (prevPath.current === pathname) {
      jumpToHash();
      return;
    }
    prevPath.current = pathname;
    lenis.resize();
    if (!jumpToHash()) lenis.scrollTo(0, { immediate: true, force: true });
  }, [pathname, lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
