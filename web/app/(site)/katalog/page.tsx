import type { Metadata } from "next";

import { CatalogNav } from "@/components/catalog/catalog-nav";
import { CategorySection } from "@/components/catalog/category-section";
import { PageIntro } from "@/components/page-intro";
import { monoLabel } from "@/components/ui";
import { getPublicCatalog, getSettings } from "@/lib/store";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Katalog",
  description: "Harga Robux via username, gamepass, komunitas, dan Digital Card. Bisa hitung jumlah custom.",
  alternates: { canonical: "/katalog" },
};

// Dibangun ulang otomatis saat admin menyimpan harga (revalidatePath).
export const revalidate = 300;

const updated = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });

export default async function KatalogPage() {
  const [{ categories, updatedAt }, settings] = await Promise.all([getPublicCatalog(), getSettings()]);

  return (
    <>
      <PageIntro
        code="03"
        label="Katalog"
        lines={["Daftar harga."]}
        body="Klik salah satu baris untuk order. Pesan WhatsApp terisi otomatis."
        aside={
          <p className={cn(monoLabel, "flex flex-col gap-1 text-muted-foreground sm:text-right")}>
            <span>Diperbarui {updated.format(new Date(updatedAt))}</span>
            <span>Bayar {settings.payments}</span>
          </p>
        }
      />
      <CatalogNav items={categories.map((c, i) => ({ id: c.id, label: c.name, code: String(i + 1).padStart(2, "0"), soldOut: c.stock.soldOut }))} />
      {categories.map((category, i) => (
        <CategorySection key={category.id} category={category} index={i} promo={settings.promo} contact={settings} />
      ))}
    </>
  );
}
