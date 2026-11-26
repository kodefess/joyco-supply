"use client";

import { Copy, Download, LoaderCircle, Printer } from "lucide-react";

import { Receipt } from "@/components/receipt/receipt-preview";
import {
  Corners,
  Kbd,
  boxClass,
  iconButton,
  monoLabel,
  primaryButton,
} from "@/components/studio/section";
import type { ReceiptStore } from "@/hooks/use-receipt";
import type { ReceiptExport } from "@/hooks/use-receipt-export";
import { cn } from "@/lib/utils";

export function PreviewPanel({
  receipt,
  exporter,
}: {
  receipt: ReceiptStore;
  exporter: ReceiptExport;
}) {
  const { draft, theme } = receipt;
  const { receiptRef, download, downloading, copySummary, print } = exporter;

  return (
    <section id="preview" aria-label="Preview nota" className="flex scroll-mt-16 flex-col gap-[2px]">
      <header className="flex gap-[2px]">
        <span className={boxClass} aria-hidden>
          {/* Titik statis: ping tanpa henti di samping area kerja cuma bikin distraksi. */}
          <span className="block size-2 rounded-full bg-brand" />
        </span>
        <p
          className={cn(
            monoLabel,
            "flex min-w-0 flex-1 items-center justify-between gap-2 bg-surface-2 px-3 text-muted-foreground",
          )}
        >
          <span className="truncate">Pratinjau langsung</span>
          <Kbd className="max-w-[9rem] truncate">{theme.name}</Kbd>
        </p>
        <button
          type="button"
          onClick={copySummary}
          aria-label="Salin ringkasan"
          title="Salin ringkasan"
          className={iconButton}
        >
          <Copy className="size-4" />
        </button>
        <button
          type="button"
          onClick={print}
          aria-label="Print / simpan PDF"
          title="Print / simpan PDF"
          className={iconButton}
        >
          <Printer className="size-4" />
        </button>
      </header>

      <div className="canvas relative flex justify-center bg-surface px-4 py-10 sm:px-8 sm:py-12">
        <Corners />
        <div id="receipt-print" className="receipt-shadow w-full max-w-[23rem]">
          <Receipt ref={receiptRef} draft={draft} theme={theme} />
        </div>
      </div>

      <button
        type="button"
        onClick={download}
        disabled={downloading}
        aria-busy={downloading || undefined}
        className={cn(primaryButton, "h-12 px-4")}
      >
        {downloading ? "Memproses…" : "Unduh PNG"}
        {downloading ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />}
      </button>
    </section>
  );
}
