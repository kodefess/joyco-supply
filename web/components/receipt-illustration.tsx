import { PaidSeal, sealCode } from "@/components/paid-seal";
import { cn } from "@/lib/utils";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

// Contoh data — ilustrasi, bukan transaksi asli.
const SAMPLE = {
  order: "J-0142",
  date: "16 Nov 2026 · 14.32",
  amount: "Rp 115.000",
  item: "1.000 Robux",
  detail: "Via Komunitas · 1 × Rp 115.000",
  payment: "QRIS",
};

/**
 * Nota digital Joyco dengan tema "Wallet" dari studio nota: kertas putih,
 * tinta navy, nominal besar di atas, segel hologram PAID/LUNAS, kartu detail,
 * dan tepi bawah bergerigi. Saat masuk layar kertas naik, segel "dicap",
 * lalu baris-barisnya muncul berurutan.
 */
export function ReceiptIllustration({ brand = "Joyco", className }: { brand?: string; className?: string }) {
  const seed = `${SAMPLE.order}|${SAMPLE.date}|${brand}|${SAMPLE.amount}`;
  const code = sealCode(seed);

  return (
    <figure data-reveal="fade" className={cn("wallet-rc relative w-full max-w-[22rem]", className)} aria-label={`Contoh nota digital ${brand}`}>
      <div className="wr-paper">
        <div className="wr-seal" aria-hidden>
          <PaidSeal seed={seed} microText={`PAID IN FULL • LUNAS • #${SAMPLE.order} • ${SAMPLE.date} • ${code}`} />
        </div>

        <p className="wr-in wr-kicker" style={d(500)}>
          Nota pembayaran
        </p>
        <p className="wr-in wr-amount" style={d(600)}>
          {SAMPLE.amount}
        </p>
        <div className="wr-in wr-to" style={d(700)}>
          <span className="wr-mark" aria-hidden>
            <svg viewBox="50 52 109 103">
              <path d="M50 52h109v16H50z" />
              <path d="M108 68h34v53l-34 34H50V80h46v52h12z" />
            </svg>
          </span>
          <span>
            ke <strong>{brand}</strong>
          </span>
        </div>

        <dl className="wr-card wr-details">
          {[
            ["Tanggal", SAMPLE.date],
            ["No. nota", `#${SAMPLE.order}`],
            ["Dibayar via", SAMPLE.payment],
            ["Item", "1"],
          ].map(([k, v], i) => (
            <div key={k} className="wr-in" style={d(850 + i * 90)}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <div className="wr-card wr-items">
          <div className="wr-in wr-item" style={d(1250)}>
            <div>
              <strong>{SAMPLE.item}</strong>
              <small>{SAMPLE.detail}</small>
            </div>
            <span>{SAMPLE.amount}</span>
          </div>
          <div className="wr-in wr-total" style={d(1350)}>
            <span>Total</span>
            <strong>{SAMPLE.amount}</strong>
          </div>
        </div>

        <p className="wr-in wr-thanks" style={d(1500)}>
          Terima kasih sudah order di {brand}!
        </p>
        <p className="wr-in wr-code" style={d(1600)}>
          Seal {code}
        </p>
      </div>
    </figure>
  );
}
