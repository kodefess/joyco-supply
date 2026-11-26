import { Avatar, ReviewPhoto } from "@/components/reviews/review-media";
import { Stars } from "@/components/reviews/stars";
import { Corners, monoLabel } from "@/components/ui";
import type { Review } from "@/lib/reviews";
import { cn } from "@/lib/utils";

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

export const formatReviewDate = (iso: string) => dateFmt.format(new Date(iso)).replace(",", " ·");

export function ReviewCard({ review, delay = 0, className }: { review: Review; delay?: number; className?: string }) {
  return (
    <figure
      data-reveal="up"
      style={{ "--d": `${delay}ms` } as React.CSSProperties}
      className={cn("group flex break-inside-avoid flex-col border border-border", className)}
    >
      <div className={cn(monoLabel, "flex h-9 items-center justify-between gap-3 bg-surface-2 px-3 text-muted-foreground")}>
        <Stars value={review.rating} />
        <time dateTime={review.createdAt} className="truncate text-[10px]">
          {formatReviewDate(review.createdAt)}
        </time>
      </div>
      <div className="relative bg-surface p-6 transition-colors duration-200 group-hover:bg-background sm:p-7">
        <Corners hover />
        {review.message && (
          <blockquote className="text-[17px] leading-snug tracking-[-0.015em] text-pretty break-words whitespace-pre-line">
            “{review.message}”
          </blockquote>
        )}
        {review.photo && <ReviewPhoto id={review.photo} name={review.name} />}
        <figcaption className="mt-6 flex items-center gap-3">
          <Avatar name={review.name} id={review.avatar} />
          <span className={cn(monoLabel, "min-w-0 flex-1 truncate font-medium text-foreground")}>{review.name}</span>
          {review.source === "admin" && (
            <span className={cn(monoLabel, "shrink-0 text-[10px] text-muted-foreground")}>Via chat</span>
          )}
          <span className={cn(monoLabel, "shrink-0 bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold text-foreground tabular-nums")}>
            {review.rating}.0
          </span>
        </figcaption>
      </div>
    </figure>
  );
}
