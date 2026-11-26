"use client";

import { useEffect, useRef } from "react";

/**
 * Jalankan `callback` setiap kali posisi scroll atau ukuran viewport berubah.
 * Lenis menggerakkan scroll native, jadi event `scroll` biasa sudah cukup dan
 * selalu sinkron dengan frame Lenis. Callback menulis style langsung ke DOM —
 * tanpa setState, tanpa re-render, tanpa jank.
 */
export function useScrollFrame(callback: () => void) {
  const ref = useRef(callback);

  useEffect(() => {
    ref.current = callback;
  });

  useEffect(() => {
    const run = () => ref.current();
    run();
    window.addEventListener("scroll", run, { passive: true });
    window.addEventListener("resize", run);
    return () => {
      window.removeEventListener("scroll", run);
      window.removeEventListener("resize", run);
    };
  }, []);
}
