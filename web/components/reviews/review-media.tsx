"use client";

import { X } from "lucide-react";
import { useRef } from "react";

import { useLenis } from "@/components/smooth-scroll";
import { imageUrl } from "@/lib/reviews";
import { cn } from "@/lib/utils";

/** Avatar kotak: foto bila ada, selain itu huruf pertama nama. */
export function Avatar({ name, id, className }: { name: string; id: string | null; className?: string }) {
  return id ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl(id)} alt="" loading="lazy" decoding="async" className={cn("size-9 shrink-0 bg-surface-2 object-cover", className)} />
  ) : (
    <span className={cn("grid size-9 shrink-0 place-items-center bg-foreground text-sm font-semibold text-background uppercase", className)}>
      {name[0] ?? "?"}
    </span>
  );
}

/** Foto testimoni (mis. screenshot chat). Klik untuk melihat ukuran penuh. */
export function ReviewPhoto({ id, name }: { id: string; name: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const lenis = useLenis();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          dialog.current?.showModal();
          lenis?.stop();
        }}
        className="press press-soft group/photo relative mt-5 block w-full overflow-hidden bg-surface-2"
        aria-label={`Lihat foto dari ${name}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl(id)}
          alt={`Testimoni dari ${name}`}
          loading="lazy"
          decoding="async"
          className="max-h-80 w-full object-cover object-top transition-transform duration-400 ease-out-expo group-hover/photo:scale-[1.03]"
        />
        <span className="absolute right-2 bottom-2 bg-background/90 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em]">Perbesar</span>
      </button>
      <dialog
        ref={dialog}
        onClose={() => lenis?.start()}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="review-dialog m-auto max-h-[calc(100dvh-2rem)] max-w-[min(56rem,calc(100vw-2rem))] bg-transparent p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-[2px]">
          <div className="flex h-11 items-center justify-between bg-surface-2 pl-3 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            {name}
            <button type="button" onClick={() => dialog.current?.close()} aria-label="Tutup" className="press grid size-11 place-items-center hover:bg-surface-3 hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl(id)} alt={`Testimoni dari ${name}`} className="max-h-[calc(100dvh-6rem)] w-auto bg-surface object-contain" />
        </div>
      </dialog>
    </>
  );
}
