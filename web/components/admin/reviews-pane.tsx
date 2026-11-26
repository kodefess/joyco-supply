"use client";

import { ChevronLeft, ChevronRight, Eye, EyeOff, ImagePlus, LoaderCircle, Plus, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";

import { Field, controlClass } from "@/components/admin/fields";
import { IconButton, Panel } from "@/components/admin/panel";
import { Avatar } from "@/components/reviews/review-media";
import { formatReviewDate } from "@/components/reviews/review-card";
import { StarIcon, Stars } from "@/components/reviews/stars";
import { Kbd, monoLabel, primaryButton, segButton } from "@/components/ui";
import { resizeImage } from "@/lib/image-client";
import { PER_PAGE, imageUrl, reviewStats, type Review } from "@/lib/reviews";
import { cn, num } from "@/lib/utils";

type Filter = "semua" | "tampil" | "menunggu";

/** Moderasi ulasan: aksi langsung tersimpan, tanpa tombol simpan. */
export function ReviewsPane({ initial }: { initial: Review[] }) {
  const [reviews, setReviews] = useState(initial);
  const [filter, setFilter] = useState<Filter>("semua");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const published = reviews.filter((r) => r.approved);
  const pending = reviews.length - published.length;
  const { average, counts } = reviewStats(published);
  const list = filter === "semua" ? reviews : reviews.filter((r) => (filter === "tampil" ? r.approved : !r.approved));
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = list.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const call = async (request: Promise<Response>, rollback: Review[]) => {
    setError("");
    try {
      const res = await request;
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Gagal.");
    } catch (e) {
      setReviews(rollback);
      setError(e instanceof Error ? e.message : "Gagal.");
    }
  };

  const setApproved = (id: string, approved: boolean) => {
    const prev = reviews;
    setReviews((list) => list.map((r) => (r.id === id ? { ...r, approved } : r)));
    call(fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, approved }) }), prev);
  };

  const remove = (r: Review) => {
    if (!confirm(`Hapus ulasan dari "${r.name}"? Tidak bisa dibatalkan.`)) return;
    const prev = reviews;
    setReviews((list) => list.filter((x) => x.id !== r.id));
    call(fetch(`/api/admin/reviews?id=${encodeURIComponent(r.id)}`, { method: "DELETE" }), prev);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-[2px] pt-4 sm:p-4 lg:p-6">
      <div className="px-2 sm:px-0">
        <p className={cn(monoLabel, "text-muted-foreground")}>Ulasan</p>
        <h1 className="mt-1 text-[clamp(1.75rem,3vw,2.5rem)] leading-none font-semibold tracking-[-0.05em]">Rating & testimoni</h1>
      </div>

      <div className="grid grid-cols-1 gap-[2px] sm:grid-cols-[14rem_minmax(0,1fr)]">
        <div className="flex flex-col justify-between gap-4 bg-surface p-5">
          <p className={cn(monoLabel, "text-muted-foreground")}>Rata-rata tampil</p>
          <p className="text-6xl leading-none font-semibold tracking-[-0.06em] tabular-nums">
            {published.length ? average.toFixed(1).replace(".", ",") : "–"}
          </p>
          <Stars value={average} size="size-4" />
        </div>
        <div className="grid grid-cols-5 gap-[2px]">
          {counts.map(({ star, count }) => (
            <div key={star} className="flex flex-col justify-between bg-surface p-3">
              <span className={cn(monoLabel, "text-muted-foreground")}>{star} ★</span>
              <span className="mt-4 text-2xl font-semibold tabular-nums">{num(count)}</span>
            </div>
          ))}
        </div>
      </div>

      <AddTestimonial onAdded={(r) => setReviews((list) => [r, ...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))} />

      <Panel
        title="Daftar"
        meta={pending > 0 ? <Kbd className="bg-amber-500 text-black">{pending} menunggu</Kbd> : <Kbd>{reviews.length}</Kbd>}
      >
        <div className="mb-[2px] flex gap-[2px]">
          {(["semua", "tampil", "menunggu"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={cn(monoLabel, "press h-10 px-4", filter === f ? "bg-foreground text-background" : "bg-surface-2 text-muted-foreground hover:bg-surface-3")}
            >
              {f}
            </button>
          ))}
        </div>
        {error && <p className={cn(monoLabel, "my-2 normal-case tracking-normal text-red-500")}>{error}</p>}

        {list.length === 0 ? (
          <p className="bg-surface-2 p-6 text-center text-muted-foreground">Tidak ada ulasan.</p>
        ) : (
          <div className="flex flex-col gap-[2px]">
            {shown.map((r) => (
              <article key={r.id} className={cn("flex gap-4 bg-surface-2 p-4", !r.approved && "shadow-[inset_2px_0_0_rgb(245_158_11)]")}>
                <Avatar name={r.name} id={r.avatar} className="max-sm:hidden" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Stars value={r.rating} />
                    <b className="text-[15px] font-medium">{r.name}</b>
                    <span className={cn(monoLabel, "text-[10px] text-muted-foreground")}>{formatReviewDate(r.createdAt)}</span>
                    {!r.approved && <Kbd className="bg-amber-500 text-black">Tersembunyi</Kbd>}
                    {r.source === "admin" && <Kbd>Admin</Kbd>}
                  </div>
                  {r.message && <p className="mt-2 text-[14px] leading-relaxed break-words whitespace-pre-line text-muted-foreground">{r.message}</p>}
                  {r.photo && (
                    <a href={imageUrl(r.photo)} target="_blank" rel="noreferrer" className="mt-3 block w-fit">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl(r.photo)} alt="" loading="lazy" className="h-28 w-auto max-w-full bg-surface object-cover" />
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 gap-[2px] self-start">
                  <IconButton label={r.approved ? "Sembunyikan" : "Tampilkan"} onClick={() => setApproved(r.id, !r.approved)} className="bg-surface">
                    {r.approved ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </IconButton>
                  <IconButton label="Hapus" danger onClick={() => remove(r)} className="bg-surface">
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>
              </article>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="mt-[2px] flex items-center gap-[2px]">
            <IconButton label="Sebelumnya" disabled={current === 1} onClick={() => setPage(current - 1)}>
              <ChevronLeft className="size-4" />
            </IconButton>
            <span className={cn(monoLabel, "flex h-10 flex-1 items-center justify-center bg-surface-2 text-muted-foreground tabular-nums")}>
              Halaman {current} / {pages}
            </span>
            <IconButton label="Berikutnya" disabled={current === pages} onClick={() => setPage(current + 1)}>
              <ChevronRight className="size-4" />
            </IconButton>
          </div>
        )}
      </Panel>
    </div>
  );
}

const nowLocal = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

/** Admin menambah testimoni sendiri — misalnya dari screenshot chat pembeli. */
function AddTestimonial({ onAdded }: { onAdded: (r: Review) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [when, setWhen] = useState(nowLocal);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState<"" | "avatar" | "photo" | "save">("");
  const [error, setError] = useState("");
  const avatarInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);

  const pick = (kind: "avatar" | "photo") => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(kind);
    setError("");
    try {
      const url = await resizeImage(file, kind === "avatar" ? { max: 192, square: true } : { max: 1200, quality: 0.8 });
      if (kind === "avatar") setAvatar(url);
      else setPhoto(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membaca gambar.");
    }
    setBusy("");
  };

  const submit = async () => {
    setBusy("save");
    setError("");
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, message, avatar, photo, createdAt: new Date(when).toISOString() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Gagal menyimpan.");
      onAdded(data);
      setName("");
      setMessage("");
      setAvatar(null);
      setPhoto(null);
      setRating(5);
      setWhen(nowLocal());
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    }
    setBusy("");
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={cn(segButton, "justify-center border border-dashed border-border-strong bg-transparent")}>
        <Plus className="size-3.5" /> Tambah testimoni (mis. screenshot chat)
      </button>
    );
  }

  return (
    <Panel
      title="Tambah testimoni"
      actions={
        <IconButton label="Tutup" onClick={() => setOpen(false)}>
          <X className="size-4" />
        </IconButton>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Nama" htmlFor="t-name">
          <input id="t-name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} className={controlClass} />
        </Field>
        <Field label="Waktu" htmlFor="t-when">
          <input id="t-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={controlClass} />
        </Field>
        <Field label="Rating" className="md:col-span-2">
          <div role="radiogroup" aria-label="Rating" className="flex gap-[2px]">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} bintang`}
                onClick={() => setRating(n)}
                className="grid size-10 place-items-center bg-surface-2 hover:bg-surface-3"
              >
                <StarIcon filled={n <= rating} className="size-5" />
              </button>
            ))}
          </div>
        </Field>
        <Field label="Pesan" hint="boleh kosong bila ada foto" htmlFor="t-msg" className="md:col-span-2">
          <textarea
            id="t-msg"
            rows={3}
            maxLength={500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={cn(controlClass, "h-auto resize-y py-2.5 leading-relaxed")}
          />
        </Field>

        <Field label="Foto profil" hint="opsional">
          <div className="flex gap-[2px]">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="size-10 object-cover" />
            ) : (
              <Avatar name={name || "?"} id={null} className="size-10" />
            )}
            <button type="button" onClick={() => avatarInput.current?.click()} className={cn(segButton, "h-10 flex-1 justify-center")}>
              {busy === "avatar" ? <LoaderCircle className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
              {avatar ? "Ganti" : "Pilih"}
            </button>
            {avatar && (
              <IconButton label="Hapus foto profil" onClick={() => setAvatar(null)}>
                <X className="size-4" />
              </IconButton>
            )}
            <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={pick("avatar")} />
          </div>
        </Field>

        <Field label="Foto testimoni" hint="screenshot chat, dll.">
          <div className="flex gap-[2px]">
            <button type="button" onClick={() => photoInput.current?.click()} className={cn(segButton, "h-10 flex-1 justify-center")}>
              {busy === "photo" ? <LoaderCircle className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
              {photo ? "Ganti foto" : "Pilih foto"}
            </button>
            {photo && (
              <IconButton label="Hapus foto testimoni" onClick={() => setPhoto(null)}>
                <X className="size-4" />
              </IconButton>
            )}
            <input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={pick("photo")} />
          </div>
        </Field>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Pratinjau foto testimoni" className="max-h-64 w-auto max-w-full justify-self-start bg-surface-2 object-contain md:col-span-2" />
        )}
      </div>

      {error && <p className={cn(monoLabel, "mt-4 normal-case tracking-normal text-red-500")}>{error}</p>}
      <button
        type="button"
        disabled={!name.trim() || busy !== ""}
        onClick={submit}
        className={cn(primaryButton, "mt-4 h-11 w-full disabled:opacity-50")}
      >
        Simpan testimoni
        {busy === "save" ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}
      </button>
    </Panel>
  );
}
