"use client";

import { track } from "@vercel/analytics";
import { Check, ImagePlus, LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { StarIcon } from "@/components/reviews/stars";
import { useLenis } from "@/components/smooth-scroll";
import { Arrow, Corners, monoLabel, primaryButton, segButton } from "@/components/ui";
import { resizeImage } from "@/lib/image-client";
import { REVIEW_LIMITS } from "@/lib/reviews";
import { cn } from "@/lib/utils";

const WORDS = ["", "Buruk", "Kurang", "Cukup", "Bagus", "Sangat baik"];

type State = { kind: "idle" } | { kind: "sending" } | { kind: "done"; pending: boolean } | { kind: "error"; message: string };

/** Tombol + dialog untuk menulis ulasan. */
export function ReviewDialog({ className, label = "Tulis ulasan" }: { className?: string; label?: string }) {
  const router = useRouter();
  const lenis = useLenis();
  const dialog = useRef<HTMLDialogElement>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<State>({ kind: "idle" });

  const open = () => {
    if (state.kind === "done") {
      setRating(0);
      setName("");
      setMessage("");
      setAvatar(null);
      setState({ kind: "idle" });
    }
    dialog.current?.showModal();
    lenis?.stop();
  };
  const close = () => dialog.current?.close();

  // Dialog ditutup lewat Esc / tombol / klik latar: lanjutkan smooth scroll.
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onClose = () => lenis?.start();
    el.addEventListener("close", onClose);
    return () => el.removeEventListener("close", onClose);
  }, [lenis]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rating) return setState({ kind: "error", message: "Pilih jumlah bintang terlebih dahulu." });
    setState({ kind: "sending" });
    const website = new FormData(e.currentTarget).get("website");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, name, message, website, avatar }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Gagal mengirim ulasan.");
      setState({ kind: "done", pending: Boolean(data?.pending) });
      track("review_submit", { rating, avatar: Boolean(avatar) });
      if (!data?.pending) router.refresh();
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Gagal mengirim ulasan." });
    }
  };

  const shown = hover || rating;

  return (
    <>
      <button type="button" onClick={open} className={cn(primaryButton, className)}>
        {label}
        <Arrow />
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="review-title"
        onClick={(e) => e.target === dialog.current && close()}
        className="review-dialog m-auto w-[min(32rem,calc(100vw-2rem))] max-w-none bg-transparent p-0 text-foreground backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        <div data-lenis-prevent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-[2px] overflow-y-auto">
          <div className={cn(monoLabel, "flex h-11 items-center justify-between bg-surface-2 pl-3 text-muted-foreground")}>
            <span className="flex items-center gap-2">
              <span className="block size-1.5 bg-brand" />
              Ulasan
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Tutup"
              className="press grid size-11 place-items-center hover:bg-surface-3 hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {state.kind === "done" ? (
            <div className="relative flex flex-col items-start gap-5 bg-background p-6">
              <Corners />
              <span className="grid size-12 place-items-center bg-brand text-brand-foreground">
                <Check className="size-6" />
              </span>
              <h2 id="review-title" className="text-3xl font-semibold tracking-[-0.05em]">
                Terima kasih.
              </h2>
              <p className="text-[15px] text-muted-foreground">
                {state.pending ? "Ulasan tampil setelah ditinjau admin." : "Ulasan sudah tampil di halaman testimoni."}
              </p>
              <button type="button" onClick={close} className={cn(segButton, "w-full justify-center")}>
                Tutup
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-[2px]">
              <div className="relative bg-background p-5 sm:p-6">
                <Corners />
                <h2 id="review-title" className="text-3xl font-semibold tracking-[-0.05em]">
                  Bagaimana order Anda?
                </h2>

                <fieldset className="mt-6">
                  <legend className={cn(monoLabel, "text-muted-foreground")}>Rating</legend>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div role="radiogroup" aria-label="Rating" className="flex gap-1" onMouseLeave={() => setHover(0)}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={rating === n}
                          aria-label={`${n} bintang — ${WORDS[n]}`}
                          onMouseEnter={() => setHover(n)}
                          onClick={() => setRating(n)}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowRight" || e.key === "ArrowUp") setRating(Math.min(5, (rating || 0) + 1));
                            if (e.key === "ArrowLeft" || e.key === "ArrowDown") setRating(Math.max(1, (rating || 2) - 1));
                          }}
                          className="press grid size-11 place-items-center bg-surface-2 [--press:0.9] hover:bg-surface-3"
                        >
                          <StarIcon
                            filled={n <= shown}
                            className={cn("size-6 transition-transform duration-200 ease-out-expo", n <= shown && "scale-110")}
                          />
                        </button>
                      ))}
                    </div>
                    <span className={cn(monoLabel, "min-w-16", shown ? "text-foreground" : "text-muted-foreground")}>
                      {shown ? WORDS[shown] : "Pilih"}
                    </span>
                  </div>
                </fieldset>

                <label htmlFor="review-name" className={cn(monoLabel, "mt-6 block text-muted-foreground")}>
                  Nama
                </label>
                <input
                  id="review-name"
                  required
                  maxLength={REVIEW_LIMITS.name}
                  autoComplete="nickname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama atau username"
                  className="mt-1.5 h-11 w-full bg-surface-2 px-3 text-[15px] outline-none transition-shadow placeholder:text-muted-foreground/60 focus:shadow-[inset_0_0_0_1.5px_var(--brand)]"
                />

                <p className={cn(monoLabel, "mt-5 text-muted-foreground")}>
                  Foto profil <span className="normal-case tracking-normal opacity-70">— opsional</span>
                </p>
                <div className="mt-1.5 flex gap-[2px]">
                  <span className="grid size-11 shrink-0 place-items-center overflow-hidden bg-surface-2 text-sm font-semibold uppercase">
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar} alt="Pratinjau foto profil" className="size-full object-cover" />
                    ) : (
                      name[0] ?? "?"
                    )}
                  </span>
                  <button
                    type="button"
                    disabled={avatarBusy}
                    onClick={() => fileInput.current?.click()}
                    className={cn(segButton, "h-11 flex-1 justify-center disabled:opacity-60")}
                  >
                    {avatarBusy ? <LoaderCircle className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
                    {avatar ? "Ganti foto" : "Pilih foto"}
                  </button>
                  {avatar && (
                    <button type="button" onClick={() => setAvatar(null)} aria-label="Hapus foto" className="press grid size-11 place-items-center bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground">
                      <X className="size-4" />
                    </button>
                  )}
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      setAvatarBusy(true);
                      try {
                        setAvatar(await resizeImage(file, { max: 192, square: true }));
                      } catch (error) {
                        setState({ kind: "error", message: error instanceof Error ? error.message : "Gagal membaca gambar." });
                      }
                      setAvatarBusy(false);
                    }}
                  />
                </div>

                <label htmlFor="review-message" className={cn(monoLabel, "mt-5 flex justify-between text-muted-foreground")}>
                  Pesan
                  <span className="tabular-nums">
                    {message.length}/{REVIEW_LIMITS.message}
                  </span>
                </label>
                <textarea
                  id="review-message"
                  required
                  rows={4}
                  minLength={REVIEW_LIMITS.minMessage}
                  maxLength={REVIEW_LIMITS.message}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ceritakan pengalaman order Anda."
                  className="mt-1.5 w-full resize-y bg-surface-2 px-3 py-2.5 text-[15px] leading-relaxed outline-none transition-shadow placeholder:text-muted-foreground/60 focus:shadow-[inset_0_0_0_1.5px_var(--brand)]"
                />

                {/* Honeypot: tersembunyi dari manusia, diisi bot. */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0" />

                <p role="alert" className={cn(monoLabel, "mt-3 min-h-4 normal-case tracking-normal text-red-500")}>
                  {state.kind === "error" ? state.message : ""}
                </p>
              </div>
              <button type="submit" disabled={state.kind === "sending"} className={cn(primaryButton, "h-12 disabled:opacity-60")}>
                Kirim ulasan
                {state.kind === "sending" ? <LoaderCircle className="size-4 animate-spin" /> : <Arrow />}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
