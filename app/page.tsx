"use client";

import {
  Download,
  Eye,
  LoaderCircle,
  LogOut,
  Palette,
  ReceiptText,
  RotateCcw,
  ShoppingBag,
  Store,
} from "lucide-react";

import { ColorSchemeToggle } from "@/components/color-scheme-toggle";
import { ToastProvider, useToast } from "@/components/toast";
import { DetailsSection } from "@/components/studio/details-section";
import { ItemsSection } from "@/components/studio/items-section";
import { PreviewPanel } from "@/components/studio/preview-panel";
import {
  Diamond,
  Kbd,
  boxClass,
  monoLabel,
  primaryButton,
  segButton,
} from "@/components/studio/section";
import { StyleSection } from "@/components/studio/style-section";
import { type ReceiptStore, useReceipt } from "@/hooks/use-receipt";
import { useReceiptExport } from "@/hooks/use-receipt-export";
import { useState } from "react";

import { money } from "@/lib/receipt-utils";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function Page() {
  return (
    <ToastProvider>
      <Studio />
    </ToastProvider>
  );
}

const NAV = [
  { href: "#details", label: "Details", icon: Store },
  { href: "#items", label: "Items", icon: ShoppingBag },
  { href: "#style", label: "Style", icon: Palette },
  { href: "#preview", label: "Preview", icon: Eye },
];

function Studio() {
  const receipt = useReceipt();
  const exporter = useReceiptExport(receipt.draft);
  const { draft, totals } = receipt;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[3.25rem_minmax(0,1fr)]">
      <StudioRail />

      <div className="min-w-0 pb-24 lg:pb-0">
        <SiteHeader receipt={receipt} />

        <main className="mx-auto grid w-full max-w-7xl gap-6 px-3 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-8 lg:px-8 xl:grid-cols-[minmax(0,1fr)_28rem]">
          <div className="flex min-w-0 flex-col gap-6">
            <StudioIntro />
            <DetailsSection receipt={receipt} />
            <ItemsSection receipt={receipt} />
            <StyleSection receipt={receipt} />
            <footer className={cn(monoLabel, "flex items-center gap-2 px-1 pb-4 text-muted-foreground")}>
              <Diamond className="size-3" />© {new Date().getFullYear()} {SITE.title}
            </footer>
          </div>

          <aside className="lg:sticky lg:top-[4.25rem] lg:self-start">
            <PreviewPanel receipt={receipt} exporter={exporter} />
          </aside>
        </main>

        {/* Bar bawah khusus mobile: total selalu terlihat + aksi utama. */}
        <div className="fixed inset-x-0 bottom-0 z-30 bg-background p-[2px] pb-[max(2px,env(safe-area-inset-bottom))] lg:hidden">
          <div className="mx-auto flex max-w-xl gap-[2px]">
            <div className="flex min-w-0 flex-1 flex-col justify-center bg-surface-2 px-3 py-1.5">
              <span className={cn(monoLabel, "text-[10px] text-muted-foreground")}>Total</span>
              <span className="truncate font-semibold tabular-nums">
                {money(totals.total, draft.currency)}
              </span>
            </div>
            <button
              type="button"
              aria-label="Show preview"
              className={cn(boxClass, "h-auto w-12 hover:bg-surface-3 hover:text-foreground")}
              onClick={() => document.getElementById("preview")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Eye className="size-4" />
            </button>
            <button
              type="button"
              onClick={exporter.download}
              disabled={exporter.downloading}
              className={cn(primaryButton, "h-auto min-h-12 gap-3")}
            >
              Save
              {exporter.downloading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Sidebar rail ala JOYCO Hub: logo, tab aktif, lompat ke tiap bagian. */
function StudioRail() {
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col gap-[2px] pr-[2px] lg:flex">
      <a
        href="/"
        aria-label={SITE.title}
        className="block h-[3.25rem] shrink-0 overflow-hidden bg-brand"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/joyco.png" alt="" width={200} height={200} className="size-full object-cover" />
      </a>
      <span className="flex flex-col items-center gap-3 bg-surface-3 py-4 text-foreground">
        <span className={cn(monoLabel, "rotate-180 font-semibold [writing-mode:vertical-rl]")}>Studio</span>
        <ReceiptText className="size-4" />
      </span>
      {NAV.map(({ href, label, icon: Icon }) => (
        <a
          key={href}
          href={href}
          title={label}
          aria-label={label}
          className="grid h-[3.25rem] shrink-0 place-items-center bg-surface-2 text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground"
        >
          <Icon className="size-4" />
        </a>
      ))}
      <span className="flex-1 bg-surface-2" />
      <span className="grid h-[3.25rem] shrink-0 place-items-center bg-surface-2">
        <Diamond className="size-5" />
      </span>
    </aside>
  );
}

const STEPS = [
  { href: "#details", label: "Details" },
  { href: "#items", label: "Items" },
  { href: "#style", label: "Style" },
];

/** Pembuka studio: segmen panel ala JOYCO Hub, copy pendek, tiga langkah. */
function StudioIntro() {
  return (
    <section aria-labelledby="studio-title" className="flex flex-col gap-[2px]">
      <div className="flex h-9 items-center justify-between bg-surface-2 px-3">
        <span className={cn(monoLabel, "flex items-center gap-2 text-muted-foreground")}>
          <span className="block size-1.5 bg-brand" />
          Studio
        </span>
        <span className={cn(monoLabel, "text-muted-foreground")}>Autosaved</span>
      </div>
      <div className="bg-surface-2 px-4 pt-5 pb-5 sm:px-5">
        <h1
          id="studio-title"
          className="text-[1.9rem] leading-none font-semibold tracking-[-0.045em] sm:text-[2.35rem]"
        >
          Make a receipt.
        </h1>
        <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
          Add the details, list the items, pick a style. Download or print when it looks right.
        </p>
      </div>
      <nav aria-label="Steps" className="grid grid-cols-3 gap-[2px]">
        {STEPS.map((step, i) => (
          <a
            key={step.href}
            href={step.href}
            className="group flex items-center gap-2.5 bg-surface-2 px-3 py-2.5 transition-colors hover:bg-surface-3 sm:px-4"
          >
            <span className={cn(monoLabel, "text-brand-text")}>0{i + 1}</span>
            <span className="text-sm font-medium">{step.label}</span>
            <span aria-hidden className="ml-auto text-muted-foreground transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </a>
        ))}
      </nav>
    </section>
  );
}

/** Keluar dari studio: hapus cookie sesi lalu muat ulang ke halaman login. */
function LogoutButton() {
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } finally {
      window.location.replace("/");
    }
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      title="Log out"
      aria-label="Log out"
      className={cn(segButton, "h-auto px-3 hover:text-danger disabled:opacity-60 sm:px-4")}
    >
      {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
      <span className="hidden md:inline">Log out</span>
    </button>
  );
}

function SiteHeader({ receipt }: { receipt: ReceiptStore }) {
  const toast = useToast();

  const reset = () => {
    const previous = receipt.draft;
    receipt.reset();
    toast({
      message: "Started a fresh receipt.",
      action: { label: "Undo", onClick: () => receipt.restore(previous) },
    });
  };

  return (
    <header className="sticky top-0 z-40 flex h-[calc(3.25rem+2px)] gap-[2px] bg-background pb-[2px]">
      <a
        href="/"
        aria-label={SITE.title}
        className="block w-[3.25rem] shrink-0 overflow-hidden bg-brand lg:hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/joyco.png" alt="" width={200} height={200} className="size-full object-cover" />
      </a>
      <div className="flex min-w-0 flex-1 items-center gap-3 bg-surface-2 px-3 sm:px-4">
        <svg viewBox="0 0 16 16" aria-hidden className="size-3.5 shrink-0 fill-none stroke-muted-foreground stroke-[1.4]">
          <path d="M8 1.5 14 5v6l-6 3.5L2 11V5z" />
        </svg>
        <span className={cn(monoLabel, "flex min-w-0 flex-col leading-tight")}>
          <b className="font-medium text-foreground">{SITE.title}</b>
          <span className="truncate text-muted-foreground">
            Studio / {receipt.draft.store || "New receipt"}
          </span>
        </span>
        <Kbd className="ml-auto hidden sm:inline">#{receipt.draft.order || "0000"}</Kbd>
      </div>
      <button type="button" onClick={reset} className={cn(segButton, "h-auto px-3 sm:px-4")}>
        <RotateCcw className="size-3.5" />
        <span className="hidden sm:inline">New receipt</span>
      </button>
      <ColorSchemeToggle />
      <LogoutButton />
    </header>
  );
}
