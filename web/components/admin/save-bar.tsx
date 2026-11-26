"use client";

import { Check, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { monoLabel, primaryButton, segButton } from "@/components/ui";
import { cn } from "@/lib/utils";

const clockFmt = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" });

export type SaveState = { kind: "idle" } | { kind: "saving" } | { kind: "saved"; at: Date } | { kind: "error"; message: string };

/**
 * State simpan untuk satu editor: kirim ke `url`, Ctrl/Cmd+S saat aktif,
 * dan peringatan sebelum menutup tab bila ada yang belum disimpan.
 */
export function useSaver<T>({ url, body, dirty, active, onSaved }: { url: string; body: unknown; dirty: boolean; active: boolean; onSaved: (data: T) => void }) {
  const [state, setState] = useState<SaveState>({ kind: "idle" });

  const save = useCallback(async () => {
    setState({ kind: "saving" });
    try {
      const res = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Gagal menyimpan.");
      onSaved(data as T);
      setState({ kind: "saved", at: new Date() });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Gagal menyimpan." });
    }
  }, [url, body, onSaved]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!active) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty) save();
      }
    };
    const onUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [active, dirty, save]);

  return { state, save };
}

export function SaveBar({
  dirty,
  state,
  onSave,
  onReset,
  savedNote = "situs sudah diperbarui",
}: {
  dirty: boolean;
  state: SaveState;
  onSave: () => void;
  onReset: () => void;
  savedNote?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex h-[calc(4rem+env(safe-area-inset-bottom,0px))] gap-[2px] bg-background pt-[2px] pb-[env(safe-area-inset-bottom,0px)]">
      <div className={cn(monoLabel, "flex min-w-0 flex-1 items-center gap-2 bg-surface-2 px-3 sm:px-4")}>
        {state.kind === "error" ? (
          <span className="truncate text-red-500">{state.message}</span>
        ) : dirty ? (
          <>
            <span className="blink block size-1.5 bg-amber-500" />
            <span className="truncate">
              <span className="sm:hidden">Belum disimpan</span>
              <span className="hidden sm:inline">Ada perubahan yang belum disimpan</span>
            </span>
            <span className="hidden text-muted-foreground sm:inline">· Ctrl+S</span>
          </>
        ) : (
          <>
            <span className="block size-1.5 bg-success" />
            <span className="truncate text-muted-foreground">
              {state.kind === "saved" ? `Tersimpan ${clockFmt.format(state.at)} · ${savedNote}` : "Semua perubahan tersimpan"}
            </span>
          </>
        )}
      </div>
      <button
        type="button"
        disabled={!dirty || state.kind === "saving"}
        onClick={() => confirm("Buang semua perubahan sejak simpan terakhir?") && onReset()}
        className={cn(segButton, "h-auto px-3 disabled:pointer-events-none disabled:opacity-40 sm:px-4")}
      >
        Batalkan
      </button>
      <button
        type="button"
        disabled={!dirty || state.kind === "saving"}
        onClick={onSave}
        className={cn(primaryButton, "h-auto gap-3 px-3 disabled:pointer-events-none disabled:opacity-40 sm:min-w-40 sm:gap-6 sm:px-4")}
      >
        Simpan
        {state.kind === "saving" ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
      </button>
    </div>
  );
}
