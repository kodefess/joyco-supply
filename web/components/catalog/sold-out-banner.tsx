import { Mascot } from "@/components/mascot";
import { Arrow, monoLabel, segButton } from "@/components/ui";
import { restockLabel, type Category } from "@/lib/catalog";
import { notifyLink, type Settings } from "@/lib/settings";
import { cn } from "@/lib/utils";

/**
 * Banner "Stok habis" untuk satu kategori: garis diagonal amber, stempel
 * HABIS, perkiraan ready, catatan admin, dan tombol minta dikabari lewat
 * WhatsApp. Harga di bawahnya tetap tampil sebagai referensi.
 */
export function SoldOutBanner({
  category,
  contact,
  compact,
  className,
}: {
  category: Category;
  contact: Pick<Settings, "whatsapp" | "brand">;
  compact?: boolean;
  className?: string;
}) {
  const { stock } = category;
  return (
    <div
      role="status"
      className={cn(
        "soldout-stripes relative flex flex-col gap-5 border-2 border-[var(--stock)] bg-surface p-5 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        {!compact && <Mascot pose="think" className="hidden w-14 shrink-0 sm:block" />}
        <div className="min-w-0">
          <span className="soldout-stamp">
            <span aria-hidden className="block size-1.5 bg-current" />
            Stok habis
          </span>
          <p className="mt-3 text-xl leading-tight font-semibold tracking-[-0.03em]">{restockLabel(stock)}</p>
          {stock.note && <p className="mt-1 text-[14px] leading-snug text-muted-foreground">{stock.note}</p>}
        </div>
      </div>
      <a href={notifyLink(contact, category)} target="_blank" rel="noreferrer" className={cn(segButton, "h-11 shrink-0 justify-between bg-background")}>
        Kabari saya saat ready
        <Arrow />
      </a>
    </div>
  );
}

/** Penanda kecil untuk tab, kartu, dan daftar. */
export function SoldOutTag({ className }: { className?: string }) {
  return (
    <span className={cn(monoLabel, "inline-flex items-center gap-1.5 border border-[var(--stock)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--stock)]", className)}>
      <span aria-hidden className="block size-1 bg-current" />
      Habis
    </span>
  );
}
