import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";
import { ReviewDialog } from "@/components/reviews/review-dialog";
import { ReviewWall } from "@/components/reviews/review-wall";
import { Stars, StarIcon } from "@/components/reviews/stars";
import { MascotSpot } from "@/components/mascot";
import { SectionHead, monoLabel } from "@/components/ui";
import { reviewStats } from "@/lib/reviews";
import { getPublishedReviews } from "@/lib/store";
import { cn, num } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Testimoni",
  description: "Rating dan ulasan pembeli Robux Joyco.",
  alternates: { canonical: "/testimoni" },
};

export const revalidate = 300;

export default async function TestimoniPage() {
  const reviews = await getPublishedReviews();
  const { total, average, counts } = reviewStats(reviews);
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <>
      <PageIntro
        code="04"
        label="Testimoni"
        lines={["Ulasan pembeli."]}
        body="Rating dan ulasan langsung dari pembeli."
        aside={<ReviewDialog />}
      />

      <section className="bg-background px-4 py-20 sm:px-8 sm:py-32">
        <SectionHead code="4.1" label="Ringkasan" aside={<span>{num(total)} ulasan</span>} />

        <div className="mt-12 grid grid-cols-1 gap-[2px] sm:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div data-reveal="up" className="flex flex-col justify-between gap-10 bg-surface p-5 sm:p-8">
            <p className={cn(monoLabel, "text-muted-foreground")}>Rata-rata</p>
            <div>
              <p className="text-[clamp(5rem,14vw,11rem)] leading-[0.8] font-semibold tracking-[-0.07em] tabular-nums">
                {total ? average.toFixed(1).replace(".", ",") : "–"}
                <span className="text-[0.3em] tracking-[-0.03em] text-muted-foreground">/5</span>
              </p>
              <Stars value={average} size="size-6" className="mt-6" />
            </div>
          </div>

          <div data-reveal="up" style={{ "--d": "100ms" } as React.CSSProperties} className="flex flex-col gap-[2px]">
            {counts.map(({ star, count }, i) => (
              <div key={star} className="flex flex-1 items-center gap-4 bg-surface px-5 py-4">
                <span className={cn(monoLabel, "flex w-12 shrink-0 items-center gap-1.5 text-foreground")}>
                  {star} <StarIcon filled className="size-3.5" />
                </span>
                <span className="relative block h-[3px] flex-1 bg-surface-3">
                  <span
                    data-reveal="line"
                    style={{ "--d": `${250 + i * 120}ms`, width: `${(count / max) * 100}%` } as React.CSSProperties}
                    className="absolute inset-y-0 left-0 bg-brand"
                  />
                </span>
                <span className={cn(monoLabel, "w-24 shrink-0 text-right text-foreground tabular-nums")}>
                  {num(count)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-4 pb-20 sm:px-8 sm:pb-32">
        <SectionHead code="4.2" label="Semua ulasan" />
        <div className="mt-12 sm:mt-16">
          {reviews.length ? (
            <ReviewWall reviews={reviews} />
          ) : (
            <div className="flex flex-col items-start gap-5 bg-surface p-6 sm:p-10">
              <MascotSpot pose="think" say="Belum ada yang mulai" side="right" />
              <p className="text-3xl font-semibold tracking-[-0.05em]">Belum ada ulasan.</p>
              <p className="text-[15px] text-muted-foreground">Jadilah yang pertama.</p>
              <ReviewDialog />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
