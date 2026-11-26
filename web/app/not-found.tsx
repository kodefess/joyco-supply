import Link from "next/link";

import SiteLayout from "@/app/(site)/layout";
import { MascotSpot } from "@/components/mascot";
import { PageIntro } from "@/components/page-intro";
import { Arrow, primaryButton } from "@/components/ui";

export default function NotFound() {
  return (
    <SiteLayout>
      <PageIntro
        code="404"
        label="Tidak ditemukan"
        lines={["Halaman", <span key="b" className="text-muted-foreground">tidak ada.</span>]}
        body="Cek lagi link-nya, atau buka katalog."
        aside={
          <div className="flex items-end gap-6">
            <MascotSpot pose="think" say="Kok kosong?" side="top" mascotClassName="w-24 sm:w-28" />
            <Link href="/katalog" className={primaryButton}>
              Ke katalog
              <Arrow />
            </Link>
          </div>
        }
      />
    </SiteLayout>
  );
}
