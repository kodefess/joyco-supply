"use client";

import { ArrowRight, CircleAlert, Eye, EyeOff, LayoutGrid, Lock, LoaderCircle, Percent, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FlowReceipt } from "@/components/admin/gate-art";
import { cn } from "@/lib/utils";

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string } | { kind: "locked" };

/**
 * Login konsol admin, memakai gerbang yang sama dengan studio nota
 * (rail kiri, strip status, diagram alur, form satu kolom) supaya kedua
 * produk JOYCO terasa satu sistem. Gaya ada di globals.css (.gate-*).
 */
export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<Status>(
    configured
      ? { kind: "idle" }
      : {
          kind: "error",
          message:
            "Password admin belum diatur di server. Tambahkan ADMIN_PASSWORD di web/.env.local (lokal) atau Environment Variables Vercel (produksi), lalu restart server.",
        },
  );
  const loading = status.kind === "loading";
  const locked = status.kind === "locked";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || loading || locked) return;
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      if (res.status === 429) {
        setPassword("");
        setStatus({ kind: "locked" });
        return;
      }
      const data = await res.json().catch(() => null);
      setPassword("");
      setStatus({ kind: "error", message: data?.error ?? "Gagal masuk. Coba lagi." });
    } catch {
      setStatus({ kind: "error", message: "Server tidak merespons. Coba lagi." });
    }
  };

  return (
    <main className="gate">
      <aside className="gate-rail" aria-hidden>
        <span className="gate-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/joyco.png" alt="" width={200} height={200} />
        </span>
        <span className="gate-tab">
          <span>Admin</span>
          <Lock size={15} />
        </span>
        <span className="gate-box">
          <LayoutGrid size={15} />
        </span>
        <span className="gate-box">
          <Percent size={15} />
        </span>
        <span className="gate-box">
          <Star size={15} />
        </span>
        <span className="gate-fill" />
        <span className="gate-box gate-diamond">
          <svg viewBox="0 0 16 16">
            <rect x="4" y="4" width="4" height="4" />
            <rect x="8" y="8" width="4" height="4" className="is-blue" />
            <rect x="8" y="4" width="4" height="4" className="is-dim" />
            <rect x="4" y="8" width="4" height="4" className="is-dim" />
          </svg>
        </span>
      </aside>

      <div className="gate-stage">
        <div className="gate-card">
          <div className="gate-strip">
            <span className={cn("gate-icon", locked && "is-locked")}>
              <Lock size={15} />
            </span>
            <span className="gate-label">
              {locked ? "Akses dijeda" : "Konsol admin"}
              <kbd>{locked ? "10 MNT" : "↵"}</kbd>
            </span>
          </div>

          <div className="gate-art">
            <i className="gate-corner is-tl" />
            <i className="gate-corner is-tr" />
            <i className="gate-corner is-bl" />
            <i className="gate-corner is-br" />
            <FlowReceipt />
          </div>

          <div className="gate-body">
            <span className="gate-chip">{locked ? "Terkunci" : configured ? "Masuk" : "Belum siap"}</span>
            <h1>{locked ? "Terlalu banyak percobaan." : "Konsol admin."}</h1>
            <p id="admin-hint">
              {locked
                ? "Login dijeda demi keamanan. Coba lagi dalam ±10 menit."
                : "Kelola katalog, stok, promo, dan ulasan. Khusus tim JOYCO."}
            </p>
          </div>

          <form onSubmit={submit} className="gate-form" aria-busy={loading || undefined}>
            <div className="gate-field">
              <label htmlFor="admin-password" className="sr-only">
                Password
              </label>
              <input
                id="admin-password"
                className="gate-input"
                type={visible ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                autoFocus
                value={password}
                disabled={locked || !configured}
                aria-invalid={status.kind === "error" || undefined}
                aria-describedby={status.kind === "error" ? "admin-error" : "admin-hint"}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (status.kind === "error" && configured) setStatus({ kind: "idle" });
                }}
              />
              <button
                type="button"
                className="gate-eye"
                onClick={() => setVisible((v) => !v)}
                aria-label="Lihat password"
                aria-pressed={visible}
                title={visible ? "Sembunyikan" : "Lihat"}
                disabled={locked || !configured}
              >
                {visible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {status.kind === "error" && (
              <p id="admin-error" role="alert" className="gate-error">
                <CircleAlert size={15} aria-hidden className="shrink-0" />
                {status.message}
              </p>
            )}

            <button type="submit" className="gate-submit" disabled={!password || loading || locked || !configured}>
              {loading ? "Memeriksa…" : "Masuk"}
              {loading ? <LoaderCircle size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            </button>
          </form>

          <p className="gate-foot">Halaman ini tidak diindeks mesin pencari.</p>
        </div>
      </div>
    </main>
  );
}
