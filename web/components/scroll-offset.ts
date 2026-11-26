// Hitung offset scroll ke sebuah section secara presisi: tinggi semua elemen
// sticky di atas (header, bar kategori) diukur langsung, lalu padding atas
// section "dimakan" supaya judulnya tepat di bawah bar — tidak kurang naik.

const BREATH = 20; // jarak napas di bawah bar sticky

/** Total tinggi elemen [data-sticky] (header, bar kategori). */
export function stickyHeight() {
  let h = 0;
  document.querySelectorAll<HTMLElement>("[data-sticky]").forEach((el) => {
    h += el.getBoundingClientRect().height;
  });
  return h;
}

/** Offset untuk lenis.scrollTo(el, { offset }) agar konten section pas di bawah bar sticky. */
export function anchorOffset(el: HTMLElement) {
  const pad = parseFloat(getComputedStyle(el).paddingTop) || 0;
  return -stickyHeight() + Math.max(0, pad - BREATH);
}

/** Posisi (relatif viewport) garis tempat isi section dianggap "aktif". */
export function contentTop(el: HTMLElement) {
  const pad = parseFloat(getComputedStyle(el).paddingTop) || 0;
  return el.getBoundingClientRect().top + Math.max(0, pad - BREATH);
}

type LenisLike = {
  scrollTo: (target: HTMLElement | number, opts?: { offset?: number; immediate?: boolean; force?: boolean; duration?: number; onComplete?: () => void }) => void;
};

/**
 * Scroll ke section, lalu ukur ulang setelah selesai: bila tata letak di
 * atasnya bergeser selama perjalanan (konten yang baru muncul, dll), koreksi
 * sisanya supaya posisi akhir selalu pas di bawah bar sticky.
 */
export function scrollToSection(lenis: LenisLike, el: HTMLElement, immediate = false) {
  const settle = (tries: number) => {
    // Jarak sisa ke posisi target; 0 berarti sudah pas.
    const delta = el.getBoundingClientRect().top + anchorOffset(el);
    if (Math.abs(delta) > 2 && tries > 0) {
      lenis.scrollTo(el, { offset: anchorOffset(el), duration: 0.4, force: true, onComplete: () => settle(tries - 1) });
    }
  };
  lenis.scrollTo(el, { offset: anchorOffset(el), immediate, force: true, onComplete: () => settle(2) });
  if (immediate) requestAnimationFrame(() => settle(2));
}
