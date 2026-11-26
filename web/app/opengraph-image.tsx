import { ImageResponse } from "next/og";

import { getSettings } from "@/lib/store";

export const alt = "Joyco — Build underground. Trusted everywhere.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 300;

// Kartu share: grid gelap ala JOYCO, tile logo biru, brand besar, garis tangga.
export default async function OpengraphImage() {
  const s = await getSettings();
  const host = s.url.replace(/^https?:\/\//, "");
  const lines = s.tagline.match(/[^.!?]+[.!?]?/g)?.map((x) => x.trim()) ?? [s.tagline];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0b0b0b", color: "#ebebeb", fontFamily: "sans-serif", position: "relative" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: i * 200, width: 1, background: "rgba(235,235,235,0.08)" }} />
        ))}
        {/* Rel alur transaksi: chat → bayar → verifikasi → kirim → nota */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, height: 2, background: "#1337ff" }} />
        {[100, 300, 500, 700, 900, 1100].map((x, i) => (
          <div
            key={x}
            style={{ position: "absolute", left: x - 14, top: 547, width: 28, height: 28, background: i === 5 ? "#1337ff" : "#0b0b0b", border: "2px solid #1337ff" }}
          />
        ))}
        {["Chat", "Bayar", "Verifikasi", "Kirim", "Nota"].map((t, i) => (
          <div key={t} style={{ position: "absolute", left: 140 + i * 200, top: 524, fontSize: 16, letterSpacing: 2, color: "#8a9cff", textTransform: "uppercase" }}>
            {t}
          </div>
        ))}

        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "56px 64px 0" }}>
          <div style={{ width: 84, height: 84, background: "#1337ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="56" height="54" viewBox="50 52 109 103">
              <path d="M50 52h109v16H50z" fill="#fff" />
              <path d="M108 68h34v53l-34 34H50V80h46v52h12z" fill="#fff" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 22, letterSpacing: 2, textTransform: "uppercase", color: "#9e9e9e" }}>
            <span style={{ color: "#ebebeb", fontWeight: 700 }}>{s.brand}</span>
            <span>{host}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", padding: "52px 64px 0", fontSize: 92, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>
          {lines.map((line, i) => (
            <span key={i} style={{ color: i === 0 ? "#ebebeb" : "#9e9e9e" }}>
              {line}
            </span>
          ))}
          <span style={{ color: "#9e9e9e", fontSize: 30, letterSpacing: 0, marginTop: 28, fontWeight: 500 }}>
            Top up Robux · Username · Gamepass · Komunitas · Digital Card
          </span>
        </div>

        <div style={{ position: "absolute", right: 64, top: 64, display: "flex", fontSize: 24, color: "#8a9cff", letterSpacing: 1 }}>{s.handle}</div>
      </div>
    ),
    size,
  );
}
