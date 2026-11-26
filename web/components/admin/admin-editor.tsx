"use client";

import { ExternalLink, LayoutGrid, LogOut, Percent, Settings2, Star, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { CatalogPane } from "@/components/admin/catalog-pane";
import { ReviewsPane } from "@/components/admin/reviews-pane";
import { SettingsEditor } from "@/components/admin/settings-editor";
import { ColorSchemeToggle } from "@/components/color-scheme-toggle";
import { LogoTile } from "@/components/logo";
import { Kbd, monoLabel, segButton } from "@/components/ui";
import { promoActive, type Catalog } from "@/lib/catalog";
import { reviewStats, type Review } from "@/lib/reviews";
import type { Settings } from "@/lib/settings";
import { cn, num } from "@/lib/utils";

type Tab = "katalog" | "promo" | "ulasan" | "pengaturan";

const TAB_ICON: Record<Tab, LucideIcon> = {
  katalog: LayoutGrid,
  promo: Percent,
  ulasan: Star,
  pengaturan: Settings2,
};

/**
 * Konsol admin: bar atas gelap (selaras dengan hero situs), ringkasan angka
 * penting, lalu tab. Tiap tab tetap ter-mount agar draf tidak hilang saat
 * pindah tab. Admin dipakai setiap hari → nyaris tanpa animasi, hanya umpan
 * balik tekan dan perubahan warna.
 */
export function AdminEditor({
  initial,
  settings,
  reviews,
  storage,
}: {
  initial: Catalog;
  settings: Settings;
  reviews: Review[];
  storage: "redis" | "memory";
}) {
  const [tab, setTab] = useState<Tab>("katalog");
  const pending = reviews.filter((r) => !r.approved).length;
  const published = reviews.filter((r) => r.approved);
  const { average } = reviewStats(published);
  const visible = initial.categories.filter((c) => c.visible).length;
  const packages = initial.categories.reduce((n, c) => n + c.items.length, 0);
  const promoOn = promoActive(settings.promo);

  const tabs: { key: Tab; label: string; badge?: React.ReactNode; alert?: boolean }[] = [
    { key: "katalog", label: "Katalog", badge: initial.categories.length },
    { key: "promo", label: "Promo", badge: promoOn ? "Aktif" : undefined },
    { key: "ulasan", label: "Ulasan", badge: pending || reviews.length || undefined, alert: pending > 0 },
    { key: "pengaturan", label: "Pengaturan" },
  ];

  const stats: { label: string; value: React.ReactNode; note: string; tab: Tab; alert?: boolean }[] = [
    { label: "Kategori", value: `${visible}/${initial.categories.length}`, note: "tampil di situs", tab: "katalog" },
    { label: "Paket", value: num(packages), note: "total item harga", tab: "katalog" },
    { label: "Promo", value: promoOn ? "Aktif" : "Nonaktif", note: promoOn ? settings.promo.label || "Sedang berjalan" : "Tidak ada kampanye", tab: "promo" },
    { label: "Ulasan", value: num(pending), note: pending ? "menunggu persetujuan" : "semua sudah ditinjau", tab: "ulasan", alert: pending > 0 },
    { label: "Rating", value: published.length ? average.toFixed(1).replace(".", ",") : "—", note: `${num(published.length)} ulasan tampil`, tab: "ulasan" },
  ];

  const logout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    window.location.reload();
  };

  return (
    <div className="flex min-h-dvh flex-col pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
      <div className="sticky top-0 z-40 flex flex-col gap-[2px] bg-background pb-[2px]">
        <header data-theme="dark" className="flex h-[3.25rem] gap-[2px] bg-background text-foreground">
          <a href="/" aria-label="Buka situs" className="press block w-[3.25rem] shrink-0">
            <LogoTile className="size-full" />
          </a>
          <div className="flex min-w-0 flex-1 items-center gap-3 bg-surface px-3 sm:px-4">
            <span className={cn(monoLabel, "flex min-w-0 flex-col leading-tight")}>
              <b className="font-medium">{settings.brand}</b>
              <span className="truncate text-muted-foreground">Konsol admin</span>
            </span>
            <span
              className={cn(monoLabel, "ml-auto hidden items-center gap-2 bg-surface-2 px-2 py-1 text-muted-foreground md:flex")}
              title={storage === "redis" ? "Data tersimpan permanen di Redis." : "Data hanya di memori dan hilang saat server dimulai ulang."}
            >
              <span className={cn("block size-1.5", storage === "redis" ? "bg-success" : "bg-amber-500")} />
              {storage === "redis" ? "Redis · tersimpan" : "Memori · sementara"}
            </span>
          </div>
          <a href="/katalog" target="_blank" rel="noreferrer" className={cn(segButton, "hidden h-auto bg-surface sm:inline-flex")}>
            Lihat situs
            <ExternalLink aria-hidden className="size-3.5" />
          </a>
          <ColorSchemeToggle className="bg-surface" />
          <button type="button" onClick={logout} className={cn(segButton, "h-auto bg-surface hover:text-red-400")} aria-label="Keluar">
            <LogOut aria-hidden className="size-3.5" />
            <span className="hidden md:inline">Keluar</span>
          </button>
        </header>

        <nav aria-label="Bagian admin" className="flex h-11 gap-[2px] overflow-x-auto [scrollbar-width:none]">
          {tabs.map((t) => {
            const Icon = TAB_ICON[t.key];
            const on = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                aria-current={on ? "page" : undefined}
                onClick={() => setTab(t.key)}
                className={cn(
                  monoLabel,
                  "press relative flex shrink-0 items-center gap-2 px-4",
                  on ? "bg-surface-3 text-foreground" : "bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground",
                )}
              >
                <Icon aria-hidden className={cn("size-3.5", on && "text-brand-text")} />
                {t.label}
                {t.badge !== undefined && <Kbd className={cn(t.alert && "bg-amber-500 text-black")}>{t.badge}</Kbd>}
                {on && <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] bg-brand" />}
              </button>
            );
          })}
          <span className="flex-1 bg-surface-2" />
        </nav>
      </div>

      {/* Ringkasan: angka yang paling sering dicek, satu klik ke tab terkait. */}
      {/* HP: satu strip geser horizontal (scroll-snap native) supaya ringkasan tidak memakan layar pertama. */}
      <section
        aria-label="Ringkasan"
        className="mb-[2px] flex snap-x snap-mandatory gap-[2px] overflow-x-auto overscroll-x-contain [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-5"
      >
        {stats.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setTab(s.tab)}
            className="press press-soft group relative flex w-[42%] min-w-[8.5rem] shrink-0 snap-start flex-col items-start bg-surface p-5 text-left hover:bg-surface-2 sm:w-auto sm:min-w-0 sm:p-6"
          >
            <span className={cn(monoLabel, "flex w-full items-center justify-between text-muted-foreground")}>
              {s.label}
              {s.alert && <span className="blink block size-1.5 bg-amber-500" />}
            </span>
            <span className="mt-3 text-[clamp(1.5rem,3vw,2.5rem)] sm:mt-4 leading-none font-bold tracking-[-0.05em] tabular-nums">{s.value}</span>
            <span className="mt-2 w-full truncate text-[13px] text-muted-foreground">{s.note}</span>
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-brand transition-transform duration-200 ease-out-expo group-hover:scale-x-100" />
          </button>
        ))}
      </section>

      <div className={cn("flex flex-1 flex-col", tab !== "katalog" && "hidden")}>
        <CatalogPane initial={initial} promo={settings.promo} active={tab === "katalog"} />
      </div>
      <div className={cn("flex flex-1 flex-col", tab !== "promo" && tab !== "pengaturan" && "hidden")}>
        <SettingsEditor
          initial={settings}
          categories={initial.categories}
          section={tab === "promo" ? "promo" : "settings"}
          active={tab === "promo" || tab === "pengaturan"}
        />
      </div>
      <div className={cn("flex flex-1 flex-col", tab !== "ulasan" && "hidden")}>
        <ReviewsPane initial={reviews} />
      </div>
    </div>
  );
}
