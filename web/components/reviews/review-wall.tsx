"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

import { ReviewCard } from "@/components/reviews/review-card";
import { StarIcon } from "@/components/reviews/stars";
import { stickyHeight } from "@/components/scroll-offset";
import { useLenis } from "@/components/smooth-scroll";
import { monoLabel } from "@/components/ui";
import { PER_PAGE, type Review } from "@/lib/reviews";
import { cn } from "@/lib/utils";

/** Nomor halaman ringkas: 1 … 4 5 6 … 12 */
function pageList(current: number, total: number) {
  const set = new Set([1, total, current - 1, current, current + 1]);
  const pages = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  pages.forEach((p, i) => {
    if (i && p - pages[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

/** Dinding ulasan: filter per bintang + halaman berisi 60 ulasan. Kolom CSS = masonry tanpa JS. */
export function ReviewWall({ reviews }: { reviews: Review[] }) {
  const [star, setStar] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const top = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  const list = star ? reviews.filter((r) => r.rating === star) : reviews;
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = list.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const filters = [null, 5, 4, 3, 2, 1].filter((s) => s === null || reviews.some((r) => r.rating === s));

  const go = (p: number) => {
    setPage(p);
    if (top.current) {
      if (lenis) lenis.scrollTo(top.current, { offset: -stickyHeight() - 24 });
      else top.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div ref={top} className="flex flex-col gap-[2px]">
      <div role="tablist" aria-label="Filter rating" className="flex gap-[2px] overflow-x-auto [scrollbar-width:none]">
        {filters.map((s) => {
          const active = star === s;
          const count = s ? reviews.filter((r) => r.rating === s).length : reviews.length;
          return (
            <button
              key={s ?? "all"}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setStar(s);
                setPage(1);
              }}
              className={cn(
                monoLabel,
                "press relative flex h-11 shrink-0 items-center gap-2 px-4",
                active ? "bg-surface-3 text-foreground" : "bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground",
              )}
            >
              {s ? (
                <>
                  {s} <StarIcon filled className="size-3" />
                </>
              ) : (
                "Semua"
              )}
              <span className={active ? "text-brand-text" : undefined}>{count}</span>
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 bottom-0 h-[2px] origin-left bg-brand transition-transform duration-300 ease-out-expo",
                  active ? "scale-x-100" : "scale-x-0",
                )}
              />
            </button>
          );
        })}
        <span className="hidden flex-1 bg-surface-2 sm:block" />
      </div>

      <div key={`${star ?? "all"}-${current}`} className="gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {shown.map((r, i) => (
          <ReviewCard key={r.id} review={r} delay={(i % 3) * 70} />
        ))}
      </div>

      {pages > 1 && (
        <nav aria-label="Halaman ulasan" className="flex flex-wrap items-stretch gap-[2px]">
          <button
            type="button"
            disabled={current === 1}
            onClick={() => go(current - 1)}
            aria-label="Halaman sebelumnya"
            className="press grid size-11 place-items-center bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronLeft className="size-4" />
          </button>
          {pageList(current, pages).map((p, i) =>
            p === "gap" ? (
              <span key={`gap-${i}`} className={cn(monoLabel, "grid h-11 w-8 place-items-center text-muted-foreground")}>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                aria-current={p === current ? "page" : undefined}
                onClick={() => go(p)}
                className={cn(
                  monoLabel,
                  "press h-11 min-w-11 px-3 tabular-nums",
                  p === current ? "bg-foreground text-background" : "bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground",
                )}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={current === pages}
            onClick={() => go(current + 1)}
            aria-label="Halaman berikutnya"
            className="press grid size-11 place-items-center bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronRight className="size-4" />
          </button>
          <span className={cn(monoLabel, "ml-auto flex items-center bg-surface-2 px-4 text-muted-foreground")}>
            {(current - 1) * PER_PAGE + 1}–{Math.min(current * PER_PAGE, list.length)} dari {list.length}
          </span>
        </nav>
      )}
    </div>
  );
}
