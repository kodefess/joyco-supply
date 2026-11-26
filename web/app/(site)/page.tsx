import Link from "next/link";

import { Faq } from "@/components/faq";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { ReceiptIllustration } from "@/components/receipt-illustration";
import { StepsTrack } from "@/components/steps-track";
import { ReviewCard } from "@/components/reviews/review-card";
import { ReviewDialog } from "@/components/reviews/review-dialog";
import { TypeCards } from "@/components/type-cards";
import { MascotSpot } from "@/components/mascot";
import { MaskHeading, SectionHead, monoLabel } from "@/components/ui";
import { RECEIPT_POINTS } from "@/lib/content";
import { getPublicCatalog, getPublishedReviews, getSettings } from "@/lib/store";
import { cn } from "@/lib/utils";

// Dibangun ulang otomatis saat admin menyimpan harga (revalidatePath).
export const revalidate = 300;

const heading = "text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.92]";

export default async function HomePage() {
  const [{ categories }, settings, reviews] = await Promise.all([getPublicCatalog(), getSettings(), getPublishedReviews()]);

  return (
    <>
      <Hero categories={categories} settings={settings} />

      <Marquee items={["Setiap transaksi tercatat", "Harga transparan", "Pembayaran fleksibel", "Dilayani admin langsung", "Dibuat untuk para pemain"]} />

      <section className="bg-background px-4 py-20 sm:px-8 sm:py-32">
        <SectionHead
          code="01"
          label="Jalur top up"
          aside={
            <Link href="/produk" className="link-line hover:text-foreground">
              Bandingkan →
            </Link>
          }
        />
        <div className="mt-10 flex items-end justify-between gap-6 sm:mt-14">
          <MaskHeading
            className={cn(heading, "max-w-3xl")}
            lines={["Pilih jalur top up.", <span key="b" className="text-muted-foreground">Hasil akhirnya sama: Robux.</span>]}
          />
          <MascotSpot pose="point" flip say="Mulai dari sini" side="left" className="-mb-6 hidden lg:inline-flex" />
        </div>
        <div className="mt-10 sm:mt-14">
          <TypeCards categories={categories} promo={settings.promo} />
        </div>
      </section>

      <section className="bg-background px-4 pb-20 sm:px-8 sm:pb-32">
        <SectionHead code="02" label="Cara order" aside={<span className="hidden sm:inline">Via WhatsApp</span>} />
        <div className="mt-10 flex items-end justify-between gap-6 sm:mt-14">
          <MaskHeading
            className={heading}
            lines={["Empat langkah.", <span key="b" className="text-muted-foreground">Semua lewat WhatsApp.</span>]}
          />
          <MascotSpot pose="cheer" say="Ikuti 4 langkah ini" side="left" className="-mb-6 hidden lg:inline-flex" />
        </div>
        <div className="mt-10 sm:mt-14">
          <StepsTrack />
        </div>
      </section>

      <section className="bg-background px-4 pb-20 sm:px-8 sm:pb-32">
        <SectionHead code="03" label="Nota digital" />
        <div className="mt-10 grid grid-cols-1 gap-3 sm:gap-4 sm:mt-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="flex flex-col bg-surface p-6 sm:p-10 lg:p-12">
            <MaskHeading
              className={heading}
              lines={["Setiap order", "punya nota.", <span key="c" className="text-muted-foreground">Bukan sekadar screenshot.</span>]}
            />
            <ul className="mt-auto flex flex-col gap-2 pt-12 sm:pt-16">
              {RECEIPT_POINTS.map((p, i) => (
                <li
                  key={p.title}
                  data-reveal="up"
                  style={{ "--d": `${[0, 60, 100][i]}ms` } as React.CSSProperties}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5 bg-surface-2 px-5 py-4"
                >
                  <span className="text-lg font-semibold tracking-[-0.03em]">{p.title}</span>
                  <span className="text-[14px] text-muted-foreground">{p.body}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="dots relative grid place-items-center overflow-clip bg-surface px-5 py-16 sm:py-24">
            <ReceiptIllustration brand={settings.brand} />
          </div>
        </div>
      </section>

      <section className="bg-background px-4 pb-20 sm:px-8 sm:pb-32">
        <SectionHead
          code="04"
          label="Testimoni"
          aside={
            <Link href="/testimoni" className="link-line hover:text-foreground">
              Semua →
            </Link>
          }
        />
        {reviews.length > 0 ? (
          <>
            <MaskHeading className={cn(heading, "mt-10 sm:mt-14")} lines={["Ulasan pembeli."]} />
            <div className="mt-10 grid grid-cols-1 gap-3 sm:gap-4 sm:mt-14 md:grid-cols-3">
              {reviews.slice(0, 3).map((r, i) => (
                <ReviewCard key={r.id} review={r} delay={[0, 60, 100][i]} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-6 bg-surface p-6 sm:mt-14 sm:p-10">
            <MascotSpot pose="think" mascotClassName="w-16 sm:w-20" />
            <p className="flex-1 text-2xl font-semibold tracking-[-0.04em]">
              Belum ada ulasan. <span className="text-muted-foreground">Sudah pernah order? Tulis yang pertama.</span>
            </p>
            <ReviewDialog />
          </div>
        )}
      </section>

      <section className="bg-background px-4 pb-20 sm:px-8 sm:pb-32">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-24">
          <div>
            <SectionHead code="05" label="FAQ" />
            <MaskHeading className={cn(heading, "mt-10")} lines={["Pertanyaan umum."]} />
            <p className={cn(monoLabel, "mt-6 text-muted-foreground")}>Jawaban singkat. Selebihnya, hubungi admin.</p>
            <MascotSpot pose="think" say="Ada pertanyaan?" side="right" className="mt-10 hidden lg:inline-flex" />
          </div>
          <Faq />
        </div>
      </section>
    </>
  );
}
