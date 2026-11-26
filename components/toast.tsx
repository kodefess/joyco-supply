"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastTone = "default" | "success" | "error";

type ToastInput = {
  message: string;
  tone?: ToastTone;
  action?: { label: string; onClick: () => void };
  duration?: number;
};

type ToastEntry = ToastInput & { id: number; leaving?: boolean };

type Timer = { handle?: ReturnType<typeof setTimeout>; remaining: number; startedAt: number };

/** Keluar lebih cepat dari masuk (masuk 300ms, keluar 160ms). */
const EXIT_MS = 160;
const MAX_TOASTS = 3;

const ToastContext = createContext<(toast: ToastInput) => void>(() => {});

export const useToast = () => useContext(ToastContext);

/**
 * Toast minimalis pengganti alert() — tidak memblokir dan bisa punya aksi
 * (mis. Balikin). Animasinya pakai CSS transition (@starting-style), bukan
 * keyframe, jadi tetap mulus walau toast muncul beruntun. Timer berhenti
 * saat kursor di atas toast atau tab sedang tidak dilihat.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, Timer>());
  const paused = useRef(false);
  /** Id toast yang masih tampil (belum keluar), urut dari yang tertua. */
  const live = useRef<number[]>([]);

  const remove = useCallback((id: number) => {
    clearTimeout(timers.current.get(id)?.handle);
    timers.current.delete(id);
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      clearTimeout(timers.current.get(id)?.handle);
      timers.current.delete(id);
      live.current = live.current.filter((x) => x !== id);
      setToasts((current) => current.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
      setTimeout(() => remove(id), EXIT_MS);
    },
    [remove],
  );

  const arm = useCallback(
    (id: number) => {
      const timer = timers.current.get(id);
      if (!timer) return;
      timer.startedAt = Date.now();
      timer.handle = setTimeout(() => dismiss(id), timer.remaining);
    },
    [dismiss],
  );

  const pause = useCallback(() => {
    paused.current = true;
    timers.current.forEach((timer) => {
      clearTimeout(timer.handle);
      timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
    });
  }, []);

  const resume = useCallback(() => {
    if (!paused.current) return;
    paused.current = false;
    timers.current.forEach((_, id) => arm(id));
  }, [arm]);

  // Toast terakhir ditutup saat kursor masih di atasnya: pointerleave tidak
  // pernah datang, jadi lepas jeda di sini supaya toast berikutnya tetap jalan.
  useEffect(() => {
    if (toasts.length === 0 && !document.hidden) paused.current = false;
  }, [toasts.length]);

  useEffect(() => {
    const onVisibility = () => (document.hidden ? pause() : resume());
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [pause, resume]);

  const show = useCallback(
    (toast: ToastInput) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { ...toast, id }]);
      live.current.push(id);
      while (live.current.length > MAX_TOASTS) dismiss(live.current[0]);
      timers.current.set(id, { remaining: toast.duration ?? 4000, startedAt: Date.now() });
      if (!paused.current) arm(id);
    },
    [arm, dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <section
        aria-label="Notifikasi"
        aria-live="polite"
        onPointerEnter={pause}
        onPointerLeave={resume}
        className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-50 flex flex-col items-center gap-[2px] px-4 lg:bottom-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            data-leaving={toast.leaving || undefined}
            className={cn(
              "pointer-events-auto flex min-h-12 w-full max-w-sm items-center gap-3 bg-foreground py-1 pr-1 pl-3.5 text-sm text-background shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)]",
              // Masuk: naik 8px + fade (300ms ease-out). Keluar: lebih cepat.
              "transition-[opacity,translate] duration-300 ease-(--ease-out) starting:translate-y-2 starting:opacity-0",
              "data-leaving:translate-y-1 data-leaving:opacity-0 data-leaving:duration-150",
              "motion-reduce:translate-y-0 motion-reduce:starting:translate-y-0 motion-reduce:data-leaving:translate-y-0",
            )}
          >
            {toast.tone === "success" && <CircleCheck aria-hidden className="size-4 shrink-0 text-success" />}
            {toast.tone === "error" && <CircleAlert aria-hidden className="size-4 shrink-0 text-danger" />}
            <span className="flex-1 py-2">{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  dismiss(toast.id);
                }}
                className="press h-10 cursor-pointer px-3 font-mono text-[11px] font-semibold tracking-[0.06em] uppercase underline underline-offset-4 hover:bg-background/10"
              >
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              aria-label="Tutup notifikasi"
              onClick={() => dismiss(toast.id)}
              className="press grid size-10 shrink-0 cursor-pointer place-items-center opacity-60 hover:bg-background/10 hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </section>
    </ToastContext.Provider>
  );
}
