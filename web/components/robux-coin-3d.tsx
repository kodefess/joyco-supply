"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/*
 * Koin Robux 3D yang bisa diputar.
 *
 * Geometri: prisma heksagon padat dari CSS 3D — muka depan, muka belakang,
 * dan 6 sisi (bukan tumpukan lapisan), jadi dari samping tetap terlihat
 * solid. Tanpa library 3D; semua transform jalan di compositor.
 *
 * Interaksi (prinsip Emil): drag memutar 1:1 dengan jari/kursor, pointer
 * capture supaya drag tidak putus, lepas = momentum dari kecepatan terakhir
 * lalu melambat kembali ke putaran idle. Bisa diinterupsi kapan saja.
 * Transform ditulis langsung ke elemen setiap frame (bukan CSS variable
 * yang memicu recalc anak-anaknya). Loop berhenti saat koin tidak terlihat
 * atau tab disembunyikan.
 */

const SIZE = 260; // lebar & tinggi muka (px); diskalakan lewat CSS
const R = SIZE / 2; // jari-jari luar heksagon
const APOTHEM = R * Math.cos(Math.PI / 6);
const DEPTH = 34; // ketebalan koin
const IDLE_SPEED = 0.02; // derajat per ms (≈ 20°/detik)
const BASE_TILT = -14;

/** Heksagon ujung-atas-runcing dalam persen kotak (untuk clip-path). */
const HEX_CLIP = "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)";

/** Warna sisi berbeda per sudut = pencahayaan palsu dari kiri atas. */
const SIDE_SHADES = ["#2a4bff", "#1a39e6", "#0f27b8", "#0a1d8f", "#0d22a3", "#1d3df0"];

function Face({ back }: { back?: boolean }) {
  return (
    <div
      className="coin-face absolute inset-0"
      style={{ clipPath: HEX_CLIP, transform: `${back ? "rotateY(180deg) " : ""}translateZ(${DEPTH / 2}px)` }}
    >
      <svg viewBox="0 0 260 260" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id={`cf-${back ? "b" : "f"}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6f87ff" />
            <stop offset="0.45" stopColor="#1f45ff" />
            <stop offset="1" stopColor="#0a1fa8" />
          </linearGradient>
        </defs>
        <rect width="260" height="260" fill={`url(#cf-${back ? "b" : "f"})`} />
        {/* Bevel: heksagon dalam sedikit lebih terang */}
        <polygon points="130,16 228.7,73 228.7,187 130,244 31.3,187 31.3,73" fill="none" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="3" />
        {/* Simbol Robux: bingkai heksagon + lubang tengah */}
        <polygon points="130,58 192.4,94 192.4,166 130,202 67.6,166 67.6,94" fill="none" stroke="#ffffff" strokeWidth="22" strokeLinejoin="round" />
        <rect x="108" y="108" width="44" height="44" rx="4" fill="none" stroke="#ffffff" strokeWidth="20" />
      </svg>
      {/* Kilau: posisinya digeser per frame mengikuti sudut putar */}
      <div className="coin-sheen absolute inset-0" />
    </div>
  );
}

export function RobuxCoin3D({ className, label = "Koin Robux 3D. Geser untuk memutar." }: { className?: string; label?: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const coin = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const el = stage.current;
    const body = coin.current;
    if (!el || !body) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const idle = reduce ? 0 : IDLE_SPEED;
    const sheens = Array.from(body.querySelectorAll<HTMLElement>(".coin-sheen"));

    let angle = -24;
    let tilt = BASE_TILT;
    let vel = idle; // derajat per ms
    let dragging = false;
    let pointerId = -1;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let raf = 0;
    let prev = performance.now();
    let visible = true;

    const render = () => {
      body.style.transform = `rotateX(${tilt.toFixed(2)}deg) rotateY(${angle.toFixed(2)}deg)`;
      // Kilau bergeser saat koin berputar; bayangan menyempit saat koin miring ke samping.
      const a = ((angle % 360) + 360) % 360;
      const pos = `${(-120 + (a % 180) * 1.6).toFixed(1)}% 0`;
      for (const s of sheens) s.style.backgroundPosition = pos;
      if (shadow.current) {
        const w = 0.55 + 0.45 * Math.abs(Math.cos((a * Math.PI) / 180));
        shadow.current.style.transform = `scaleX(${w.toFixed(3)})`;
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(48, now - prev);
      prev = now;
      if (!dragging) {
        // Momentum meluruh ke kecepatan idle; kemiringan kembali ke posisi dasar.
        vel += (idle - vel) * (1 - Math.exp(-dt / 700));
        angle += vel * dt;
        tilt += (BASE_TILT - tilt) * (1 - Math.exp(-dt / 260));
      }
      render();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || !visible || document.hidden) return;
      prev = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onDown = (e: PointerEvent) => {
      if (dragging) return; // abaikan jari kedua
      dragging = true;
      pointerId = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = performance.now();
      vel = 0;
      el.dataset.dragging = "";
      setTouched(true);
      // Capture supaya drag tetap jalan walau kursor keluar panggung.
      try {
        el.setPointerCapture(e.pointerId);
      } catch {}
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dt = Math.max(1, now - lastT);
      const d = dx * 0.55;
      angle += d;
      tilt = Math.max(-40, Math.min(25, tilt - dy * 0.25));
      // Kecepatan dihaluskan supaya satu event terakhir tidak mendominasi.
      vel = vel * 0.6 + (d / dt) * 0.4;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
      render();
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      dragging = false;
      pointerId = -1;
      // Batasi lemparan supaya tidak berputar liar.
      vel = Math.max(-1.2, Math.min(1.2, vel));
      if (performance.now() - lastT > 80) vel = idle; // ditahan diam sebelum dilepas
      delete el.dataset.dragging;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") vel -= 0.25;
      else if (e.key === "ArrowRight") vel += 0.25;
      else return;
      e.preventDefault();
      setTouched(true);
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("keydown", onKey);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(el);
    // Skala koin mengikuti lebar panggung (geometri 3D tetap dalam px pasti).
    const ro = new ResizeObserver(([entry]) => {
      if (float.current) float.current.style.scale = String((entry.contentRect.width * 0.62) / SIZE);
    });
    ro.observe(el);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    render();
    start();
    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div
        ref={stage}
        role="img"
        aria-label={label}
        tabIndex={0}
        className="coin-stage relative grid aspect-square w-full cursor-grab place-items-center outline-offset-4 select-none data-[dragging]:cursor-grabbing"
      >
        {/* Cahaya & lantai: dekoratif */}
        <div aria-hidden className="coin-glow pointer-events-none absolute inset-[6%]" />
        <div ref={shadow} aria-hidden className="coin-shadow pointer-events-none absolute bottom-[4%] h-[7%] w-[56%]" />

        <div ref={float} className="coin-float pointer-events-none absolute top-1/2 left-1/2" style={{ width: SIZE, height: SIZE, marginLeft: -SIZE / 2, marginTop: -SIZE / 2 }}>
          <div ref={coin} className="coin relative size-full" style={{ transformStyle: "preserve-3d" }}>
            <Face />
            <Face back />
            {SIDE_SHADES.map((shade, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2"
                style={{
                  width: R + 1, // +1px menutup celah antialias di sudut
                  height: DEPTH,
                  marginLeft: -(R + 1) / 2,
                  marginTop: -DEPTH / 2,
                  background: `linear-gradient(90deg, ${shade}, color-mix(in srgb, ${shade} 70%, #000))`,
                  transform: `rotateZ(${30 + i * 60}deg) translateY(${-APOTHEM}px) rotateX(90deg)`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <p
        aria-hidden
        className={cn(
          "pointer-events-none mt-1 flex items-center gap-2 font-mono text-[11px] tracking-[0.06em] text-muted-foreground uppercase transition-opacity duration-300",
          touched && "opacity-0",
        )}
      >
        <svg viewBox="0 0 24 12" className="h-2.5 w-5 fill-none stroke-current stroke-[1.5]">
          <path d="M1 6h22M5 2 1 6l4 4M19 2l4 4-4 4" />
        </svg>
        Geser untuk memutar
      </p>
    </div>
  );
}
