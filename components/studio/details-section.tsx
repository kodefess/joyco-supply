"use client";

import { useRef, useState } from "react";
import { Dices, Hash, ImageUp, LoaderCircle, Store, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/toast";
import {
  FieldShell,
  Section,
  TextField,
  controlClass,
  iconButton,
  segButton,
} from "@/components/studio/section";
import type { ReceiptStore } from "@/hooks/use-receipt";
import { currencies, isoToFlag, pickThankYou } from "@/lib/receipt-utils";
import { cn } from "@/lib/utils";

const MAX_LOGO_BYTES = 2_000_000;

export function DetailsSection({ receipt }: { receipt: ReceiptStore }) {
  const { draft, set, totals } = receipt;
  const toast = useToast();
  const [generating, setGenerating] = useState(false);

  const generateNumber = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store: draft.store,
          title: draft.title,
          payment: draft.payment,
          currency: draft.currency,
          items: draft.items,
          total: totals.total,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { receiptNumber: string } = await res.json();
      set("order", data.receiptNumber);
      toast({ message: `No. ${data.receiptNumber} siap.`, tone: "success" });
    } catch (error) {
      console.error("Failed to generate receipt number", error);
      toast({ message: "Nomor gagal dibuat. Coba lagi.", tone: "error" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Section id="details" icon={Store} title="Detail" description="Identitas toko dan metode pembayaran.">
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        <TextField
          id="store-name"
          label="Nama toko"
          value={draft.store}
          onChange={(v) => set("store", v)}
          placeholder="Nama tokomu"
        />
        <TextField
          id="receipt-title"
          label="Judul nota"
          value={draft.title}
          onChange={(v) => set("title", v)}
          placeholder="Nota pembayaran"
        />

        <LogoField
          logo={draft.logo}
          onChange={(logo) => set("logo", logo)}
          onError={(message) => toast({ message, tone: "error" })}
        />

        <TextField
          id="order-number"
          label="No. nota"
          value={draft.order}
          onChange={(v) => set("order", v)}
          placeholder="0001"
          suffix={
            <button
              type="button"
              onClick={generateNumber}
              disabled={generating}
              aria-busy={generating || undefined}
              aria-label="Buat nomor nota"
              title="Buat nomor nota"
              className={segButton}
            >
              {generating ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <Hash className="size-3.5" />
              )}
              <span className="hidden sm:inline">Buat</span>
            </button>
          }
        />
        <TextField
          id="receipt-date"
          label="Tanggal"
          value={draft.date}
          onChange={(v) => set("date", v)}
          placeholder="DD.MM.YYYY"
        />
        <TextField
          id="payment-method"
          label="Metode bayar"
          value={draft.payment}
          onChange={(v) => set("payment", v)}
          placeholder="Cash, QRIS, kartu…"
        />

        <FieldShell id="currency" label="Mata uang">
          <Select value={draft.currency} onValueChange={(v) => v && set("currency", v)}>
            <SelectTrigger id="currency" className={cn(controlClass, "w-full justify-between")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="p-1">
              {currencies.map((c) => (
                <SelectItem key={c.code} value={c.code} className="py-2">
                  <span aria-hidden>{isoToFlag(c.flag)}</span>
                  <span className="font-medium">{c.code}</span>
                  <span className="text-xs text-muted-foreground">{c.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>

        <FieldShell id="thanks-1" label="Pesan penutup" className="sm:col-span-2">
          <div className="flex gap-[2px]">
            <div className="grid min-w-0 flex-1 gap-[2px] sm:grid-cols-2">
              <Input
                id="thanks-1"
                value={draft.thanks[0]}
                onChange={(e) => set("thanks", [e.target.value, draft.thanks[1]])}
                className={controlClass}
              />
              <Input
                aria-label="Pesan penutup, baris 2"
                value={draft.thanks[1]}
                onChange={(e) => set("thanks", [draft.thanks[0], e.target.value])}
                className={controlClass}
              />
            </div>
            <button
              type="button"
              onClick={() => set("thanks", pickThankYou(draft.thanks))}
              aria-label="Acak pesan penutup"
              title="Acak pesan"
              className={cn(iconButton, "h-auto")}
            >
              <Dices className="size-4" />
            </button>
          </div>
        </FieldShell>
      </div>
    </Section>
  );
}

function LogoField({
  logo,
  onChange,
  onError,
}: {
  logo: string;
  onChange: (logo: string) => void;
  onError: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const readFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return onError("Itu bukan gambar.");
    if (file.size > MAX_LOGO_BYTES) return onError("Kegedean. Maks 2 MB.");
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <FieldShell id="logo" label="Logo" className="sm:col-span-2">
      <input
        ref={inputRef}
        id="logo"
        type="file"
        tabIndex={-1}
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="sr-only"
        onChange={(e) => {
          readFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {logo ? (
        <div className="flex gap-[2px]">
          <span className="flex min-w-0 flex-1 items-center gap-3 bg-surface-2 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="Logo terpasang" className="size-10 object-cover" />
            <span className="truncate text-sm text-muted-foreground">Logo terpasang</span>
          </span>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(segButton, "h-auto")}
          >
            <ImageUp className="size-3.5" />
            Ganti
          </button>
          <button
            type="button"
            aria-label="Hapus logo"
            title="Hapus logo"
            onClick={() => onChange("")}
            className={cn(iconButton, "h-auto w-12 hover:bg-danger hover:text-white")}
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            readFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "press flex cursor-pointer items-center gap-3 border border-dashed border-border-strong bg-surface-2/50 px-3 py-3 text-left hover:bg-surface-2",
            dragging && "border-brand bg-brand/10",
          )}
        >
          <span aria-hidden className="grid size-10 shrink-0 place-items-center bg-surface-3 text-muted-foreground">
            <ImageUp className="size-4" />
          </span>
          <span className="text-sm">
            <span className="font-medium">{dragging ? "Lepas di sini" : "Unggah logo persegi"}</span>
            <span className="block text-[13px] text-muted-foreground">
              Drop atau klik · PNG, JPG, WebP, SVG · maks 2 MB
            </span>
          </span>
        </button>
      )}
    </FieldShell>
  );
}
