"use client";

import { ArrowUp, Eye, EyeOff, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

import { Field, NumberInput, controlClass } from "@/components/admin/fields";
import { IconButton, Panel, Toggle } from "@/components/admin/panel";
import { SaveBar, useSaver } from "@/components/admin/save-bar";
import { PriceTag, PromoBadge } from "@/components/price-tag";
import { Kbd, monoLabel } from "@/components/ui";
import { priceItem, promoActive, type Category } from "@/lib/catalog";
import { uid } from "@/lib/catalog";
import {
  DEFAULT_MESSAGES,
  MESSAGE_TOKENS,
  SOCIAL_KEYS,
  SOCIAL_PLATFORMS,
  discordHref,
  generalMessage,
  orderMessage,
  socialHref,
  type Messages,
  type Settings,
  type Social,
  type SocialPlatform,
} from "@/lib/settings";
import { cn, num } from "@/lib/utils";

/** ISO → nilai <input type="datetime-local"> (waktu lokal). */
const toLocalInput = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

/**
 * Editor pengaturan situs. Satu state untuk dua tab (Promo & Pengaturan)
 * karena keduanya tersimpan di objek Settings yang sama.
 */
export function SettingsEditor({
  initial,
  categories,
  section,
  active,
}: {
  initial: Settings;
  categories: Category[];
  section: "promo" | "settings";
  active: boolean;
}) {
  const [saved, setSaved] = useState(initial);
  const [s, setS] = useState(initial);
  const dirty = useMemo(() => JSON.stringify(s) !== JSON.stringify(saved), [s, saved]);
  const onSaved = useCallback((data: Settings) => {
    setSaved(data);
    setS(data);
  }, []);
  const { state, save } = useSaver<Settings>({ url: "/api/admin/settings", body: s, dirty, active, onSaved });
  const set = (patch: Partial<Settings>) => setS((prev) => ({ ...prev, ...patch }));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-[2px] pt-4 sm:p-4 lg:p-6">
      {section === "promo" ? <PromoSection s={s} set={set} categories={categories} /> : <GeneralSection s={s} set={set} categories={categories} />}
      {active && <SaveBar dirty={dirty} state={state} onSave={save} onReset={() => setS(saved)} />}
    </div>
  );
}

type SectionProps = { s: Settings; set: (patch: Partial<Settings>) => void };

/* ------------------------------------------------------------------ */
/* Promo                                                                */
/* ------------------------------------------------------------------ */

function PromoSection({ s, set, categories }: SectionProps & { categories: Category[] }) {
  const p = s.promo;
  const setP = (patch: Partial<Settings["promo"]>) => set({ promo: { ...p, ...patch } });
  const live = promoActive(p);
  const all = p.categoryIds.length === 0;
  const toggleCat = (id: string) =>
    setP({ categoryIds: p.categoryIds.includes(id) ? p.categoryIds.filter((x) => x !== id) : [...p.categoryIds, id] });

  // Item yang punya harga promo sendiri (diatur di tab Katalog).
  const itemPromos = categories.flatMap((c) =>
    c.items.filter((i) => i.promoPrice !== null && i.promoPrice < i.price).map((i) => ({ c, i })),
  );
  const sample = categories.find((c) => c.items.some((i) => i.robux) && (all || p.categoryIds.includes(c.id)));
  const sampleItem = sample?.items.find((i) => i.robux === 1_000) ?? sample?.items.find((i) => i.robux);

  return (
    <>
      <div className="px-2 sm:px-0">
        <p className={cn(monoLabel, "text-muted-foreground")}>Promo</p>
        <h1 className="mt-1 text-[clamp(1.75rem,3vw,2.5rem)] leading-none font-semibold tracking-[-0.05em]">Kampanye promo</h1>
      </div>

      <Panel title="Status" meta={live ? <Kbd className="bg-brand text-brand-foreground">Berjalan</Kbd> : <Kbd>Tidak aktif</Kbd>}>
        <Toggle
          checked={p.enabled}
          onChange={(enabled) => setP({ enabled })}
          label="Promo aktif"
          description="Menampilkan bar promo di atas situs dan menerapkan diskon persen ke kategori terpilih."
        />
        {p.enabled && !live && <p className="mt-3 text-[13px] text-amber-500">Waktu berakhir sudah lewat — promo tidak tampil.</p>}
      </Panel>

      <Panel title="Isi">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[12rem_minmax(0,1fr)]">
          <Field label="Label badge" hint="mis. 11.11" htmlFor="promo-label">
            <input id="promo-label" value={p.label} maxLength={24} onChange={(e) => setP({ label: e.target.value })} className={controlClass} />
          </Field>
          <Field label="Pesan di bar promo" htmlFor="promo-message">
            <input
              id="promo-message"
              value={p.message}
              maxLength={160}
              placeholder="Diskon 10% semua Robux via Komunitas"
              onChange={(e) => setP({ message: e.target.value })}
              className={controlClass}
            />
          </Field>
          <Field label="Diskon" hint="0 = tanpa diskon persen">
            <NumberInput value={p.percent} prefix="%" onChange={(v) => setP({ percent: Math.min(90, v ?? 0) })} />
          </Field>
          <Field label="Berakhir" hint="kosongkan = tanpa batas" htmlFor="promo-end">
            <div className="flex gap-[2px]">
              <input
                id="promo-end"
                type="datetime-local"
                value={toLocalInput(p.endsAt)}
                onChange={(e) => setP({ endsAt: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                className={controlClass}
              />
              {p.endsAt && (
                <button type="button" onClick={() => setP({ endsAt: "" })} className={cn(monoLabel, "shrink-0 bg-surface-2 px-3 text-muted-foreground hover:bg-surface-3")}>
                  Hapus
                </button>
              )}
            </div>
          </Field>
        </div>
      </Panel>

      <Panel title="Diskon persen berlaku untuk" meta={<Kbd>{all ? "Semua" : p.categoryIds.length}</Kbd>}>
        <div className="flex flex-wrap gap-[2px]">
          <button
            type="button"
            onClick={() => setP({ categoryIds: [] })}
            className={cn(monoLabel, "press h-10 px-4", all ? "bg-foreground text-background" : "bg-surface-2 text-muted-foreground hover:bg-surface-3")}
          >
            Semua kategori
          </button>
          {categories.map((c) => {
            const on = p.categoryIds.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleCat(c.id)}
                className={cn(monoLabel, "press h-10 px-4", on ? "bg-brand text-brand-foreground" : "bg-surface-2 text-muted-foreground hover:bg-surface-3")}
              >
                {c.name}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[13px] text-muted-foreground">
          Item yang punya harga promo sendiri tetap memakai harga promonya. Harga promo per item diatur di tab Katalog.
        </p>
      </Panel>

      <Panel title="Pratinjau">
        <div className="flex flex-col gap-[2px]">
          <div className={cn(monoLabel, "flex h-9 items-center gap-3 bg-brand px-3 text-brand-foreground")}>
            <span className="bg-brand-foreground px-1.5 py-0.5 font-bold text-brand">✦ {p.label || "Promo"}</span>
            <span className="truncate normal-case tracking-normal text-[13px]">{p.message || (p.percent ? `Diskon ${p.percent}%` : "Promo sedang berjalan")}</span>
          </div>
          {sample && sampleItem && (
            <div className="flex items-center justify-between gap-4 bg-background px-4 py-4">
              <span>
                <span className="text-2xl font-semibold tracking-[-0.05em] tabular-nums">{num(sampleItem.robux!)}</span>{" "}
                <span className={cn(monoLabel, "text-muted-foreground")}>Robux · {sample.name}</span>
              </span>
              <PriceTag priced={priceItem(sampleItem, sample, { ...p, enabled: true, endsAt: "" })} />
            </div>
          )}
        </div>
      </Panel>

      {itemPromos.length > 0 && (
        <Panel title="Harga promo per item" meta={<Kbd>{itemPromos.length}</Kbd>}>
          <div className="flex flex-col gap-[2px]">
            {itemPromos.map(({ c, i }) => (
              <div key={i.id} className="flex items-center justify-between gap-3 bg-surface-2 px-3 py-2.5">
                <span className="min-w-0 truncate text-[14px]">
                  {i.robux !== null ? `${num(i.robux)} Robux` : i.label} <span className="text-muted-foreground">· {c.name}</span>
                </span>
                <span className="flex items-center gap-3">
                  <PromoBadge percent={Math.round((1 - i.promoPrice! / i.price) * 100)} />
                  <PriceTag priced={priceItem(i, c, null)} />
                </span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Pengaturan umum: brand, SEO, kontak, sosial, ulasan                  */
/* ------------------------------------------------------------------ */

function GeneralSection({ s, set, categories }: SectionProps & { categories: Category[] }) {
  const [keywordsDraft, setKeywordsDraft] = useState(s.keywords.join(", "));
  const host = s.url.replace(/^https?:\/\//, "");

  return (
    <>
      <div className="px-2 sm:px-0">
        <p className={cn(monoLabel, "text-muted-foreground")}>Pengaturan</p>
        <h1 className="mt-1 text-[clamp(1.75rem,3vw,2.5rem)] leading-none font-semibold tracking-[-0.05em]">Brand, SEO & sosial</h1>
      </div>

      <Panel title="Brand & SEO">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Nama brand" htmlFor="set-brand">
            <input id="set-brand" value={s.brand} maxLength={40} onChange={(e) => set({ brand: e.target.value })} className={controlClass} />
          </Field>
          <Field label="Tagline" hint="ikut di judul tab" htmlFor="set-tagline">
            <input id="set-tagline" value={s.tagline} maxLength={80} onChange={(e) => set({ tagline: e.target.value })} className={controlClass} />
          </Field>
          <Field label="Deskripsi" hint={`${s.description.length}/160 ideal`} htmlFor="set-desc" className="md:col-span-2">
            <textarea
              id="set-desc"
              rows={2}
              maxLength={300}
              value={s.description}
              onChange={(e) => set({ description: e.target.value })}
              className={cn(controlClass, "h-auto resize-y py-2.5 leading-relaxed", s.description.length > 160 && "shadow-[inset_0_0_0_1.5px_rgb(245_158_11)]")}
            />
          </Field>
          <Field label="URL situs" htmlFor="set-url">
            <input id="set-url" type="url" value={s.url} onChange={(e) => set({ url: e.target.value })} className={controlClass} />
          </Field>
          <Field label="Handle utama" hint="untuk kartu share X/Twitter" htmlFor="set-handle">
            <input id="set-handle" value={s.handle} maxLength={40} onChange={(e) => set({ handle: e.target.value })} className={controlClass} />
          </Field>
          <Field label="Kata kunci" hint="pisahkan dengan koma" htmlFor="set-keywords" className="md:col-span-2">
            <input
              id="set-keywords"
              value={keywordsDraft}
              onChange={(e) => {
                setKeywordsDraft(e.target.value);
                set({ keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) });
              }}
              className={controlClass}
            />
          </Field>
        </div>

        {/* Pratinjau hasil pencarian & kartu share */}
        <div className="mt-5 grid grid-cols-1 gap-[2px] md:grid-cols-2">
          <div className="bg-background p-4">
            <p className={cn(monoLabel, "mb-3 text-[10px] text-muted-foreground")}>Hasil pencarian</p>
            <p className="text-[12px] text-muted-foreground">{host}</p>
            <p className="mt-0.5 truncate text-[18px] text-[#1a0dab] dark:text-[#8ab4f8]">
              {s.brand} — {s.tagline}
            </p>
            <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">{s.description}</p>
          </div>
          <div className="bg-background p-4">
            <p className={cn(monoLabel, "mb-3 text-[10px] text-muted-foreground")}>Kartu share</p>
            <div className="overflow-hidden border border-border-strong">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/opengraph-image" alt="" className="aspect-[1200/630] w-full bg-surface-2 object-cover" />
              <div className="p-2.5">
                <p className="text-[11px] text-muted-foreground">{host}</p>
                <p className="truncate text-[13px] font-medium">{s.brand} — {s.tagline}</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Gambar diperbarui setelah disimpan.</p>
          </div>
        </div>
      </Panel>

      <Panel title="Kontak">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="WhatsApp admin" hint="62812…" htmlFor="set-wa">
            <input id="set-wa" inputMode="numeric" value={s.whatsapp} onChange={(e) => set({ whatsapp: e.target.value.replace(/\D/g, "") })} className={controlClass} />
          </Field>
          <Field label="Jam buka" htmlFor="set-hours">
            <input id="set-hours" value={s.hours} maxLength={40} onChange={(e) => set({ hours: e.target.value })} className={controlClass} />
          </Field>
          <Field label="Cara bayar" htmlFor="set-pay">
            <input id="set-pay" value={s.payments} maxLength={80} onChange={(e) => set({ payments: e.target.value })} className={controlClass} />
          </Field>
        </div>
      </Panel>

      <MessagesPanel s={s} set={set} categories={categories} />

      <SocialsPanel socials={s.socials} onChange={(socials) => set({ socials })} />

      <Panel title="Ulasan">
        <Toggle
          checked={s.moderateReviews}
          onChange={(moderateReviews) => set({ moderateReviews })}
          label="Ulasan baru perlu disetujui"
          description="Bila mati, ulasan langsung tampil di Testimoni. Admin tetap bisa menyembunyikan atau menghapus."
        />
      </Panel>
    </>
  );
}

/** Daftar akun sosial: tambah dari preset atau platform lain, atur urutan & tampil di footer. */
function SocialsPanel({ socials, onChange }: { socials: Social[]; onChange: (s: Social[]) => void }) {
  const update = (id: string, patch: Partial<Social>) => onChange(socials.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const add = (platform: SocialPlatform) =>
    onChange([...socials, { id: `${platform}-${uid()}`, platform, label: platform === "custom" ? "" : SOCIAL_PLATFORMS[platform].label, handle: "", url: "", visible: true }]);
  const move = (i: number) => {
    const next = [...socials];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onChange(next);
  };
  const shown = socials.filter((x) => x.visible).length;
  const discord = discordHref({ socials });

  return (
    <Panel title="Sosial media" meta={<Kbd>{shown} tampil</Kbd>}>
      <p className={cn(monoLabel, "mb-4 flex flex-wrap items-center gap-2 normal-case tracking-normal text-[13px] text-muted-foreground")}>
        <span className="block size-1.5 bg-[#5865f2]" />
        {discord ? (
          <>
            Tombol Discord di navigasi aktif → <span className="text-foreground">{discord}</span>
          </>
        ) : (
          <>Isi URL undangan pada baris Discord (mis. https://discord.gg/xxxx) untuk menampilkan tombol Discord di navigasi.</>
        )}
      </p>
      <div className="flex flex-col gap-[2px]">
        {socials.length === 0 && <p className="bg-surface-2 p-4 text-[14px] text-muted-foreground">Belum ada akun. Tambahkan di bawah.</p>}
        {socials.map((x, i) => {
          const href = socialHref(x);
          return (
            <div key={x.id} className={cn("grid grid-cols-1 gap-[2px] md:grid-cols-[9rem_minmax(0,12rem)_minmax(0,1fr)_auto]", !x.visible && "opacity-60")}>
              <input
                aria-label="Nama platform"
                value={x.label}
                placeholder="Nama platform"
                maxLength={30}
                onChange={(e) => update(x.id, { label: e.target.value })}
                className={cn(controlClass, "font-mono text-[12px] uppercase tracking-[0.06em]")}
              />
              <input
                aria-label={`${x.label || "Akun"} handle`}
                value={x.handle}
                placeholder="@joycomart"
                onChange={(e) => update(x.id, { handle: e.target.value })}
                className={controlClass}
              />
              <input
                aria-label={`${x.label || "Akun"} URL`}
                type="url"
                value={x.url}
                placeholder={href || "https://"}
                onChange={(e) => update(x.id, { url: e.target.value })}
                className={controlClass}
              />
              <span className="flex gap-[2px]">
                <IconButton label={x.visible ? "Sembunyikan dari footer" : "Tampilkan di footer"} onClick={() => update(x.id, { visible: !x.visible })}>
                  {x.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </IconButton>
                <IconButton label="Naikkan" disabled={i === 0} onClick={() => move(i)}>
                  <ArrowUp className="size-4" />
                </IconButton>
                <IconButton label="Hapus" danger onClick={() => onChange(socials.filter((y) => y.id !== x.id))}>
                  <Trash2 className="size-4" />
                </IconButton>
              </span>
            </div>
          );
        })}
      </div>
      <p className={cn(monoLabel, "mt-4 mb-2 text-muted-foreground")}>Tambah</p>
      <div className="flex flex-wrap gap-[2px]">
        {SOCIAL_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => add(k)}
            className={cn(monoLabel, "flex h-9 items-center gap-1.5 bg-surface-2 px-3 text-muted-foreground press hover:bg-surface-3 hover:text-foreground")}
          >
            <Plus className="size-3" />
            {SOCIAL_PLATFORMS[k].label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[13px] text-muted-foreground">
        URL kosong dirakit otomatis dari handle (kecuali Discord & Lainnya). Akun tanpa handle dan URL tidak disimpan.
      </p>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Template pesan WhatsApp                                              */
/* ------------------------------------------------------------------ */

/** Contoh order untuk pratinjau: utamakan Digital Card, lalu kategori pertama yang punya paket Robux. */
function sampleOrder(categories: Category[], promo: Settings["promo"]) {
  const withItems = categories.filter((c) => c.items.some((i) => i.robux));
  const cat = withItems.find((c) => c.type === "card") ?? withItems[0] ?? categories[0];
  if (!cat) return null;
  const item = cat.items.find((i) => i.robux) ?? cat.items[0];
  if (!item) return null;
  return { cat, item, price: priceItem(item, cat, promo).price };
}

function MessagesPanel({ s, set, categories }: SectionProps & { categories: Category[] }) {
  const refs = { order: useRef<HTMLTextAreaElement>(null), general: useRef<HTMLTextAreaElement>(null) };
  const [focus, setFocus] = useState<keyof Messages>("order");
  const sample = sampleOrder(categories, s.promo);
  const setMsg = (patch: Partial<Messages>) => set({ messages: { ...s.messages, ...patch } });

  // Sisipkan placeholder di posisi kursor pada textarea yang terakhir difokus.
  const insert = (token: string) => {
    const el = refs[focus].current;
    const value = s.messages[focus];
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    setMsg({ [focus]: value.slice(0, start) + token + value.slice(end) });
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const fields: { key: keyof Messages; label: string; hint: string; preview: string }[] = [
    {
      key: "order",
      label: "Pesan tombol beli",
      hint: "katalog, kalkulator, cek harga",
      preview: sample ? orderMessage(s, sample.cat, sample.item, sample.price) : "Tambahkan paket di katalog untuk melihat pratinjau.",
    },
    { key: "general", label: "Pesan chat admin", hint: "header, hero, footer, tombol WhatsApp", preview: generalMessage(s) },
  ];

  return (
    <Panel title="Pesan WhatsApp" meta={<Kbd>{MESSAGE_TOKENS.length} placeholder</Kbd>}>
      <p className="text-[14px] text-muted-foreground">
        Teks yang terisi otomatis saat pembeli menekan tombol. Klik placeholder untuk menyisipkannya di posisi kursor.
      </p>

      <div className="mt-4 flex flex-wrap gap-[2px]" aria-label="Placeholder">
        {MESSAGE_TOKENS.map((t) => (
          <button
            key={t.token}
            type="button"
            onClick={() => insert(t.token)}
            title={t.example ? `${t.desc} — contoh: ${t.example}` : t.desc}
            className={cn(monoLabel, "press flex h-9 items-center gap-2 bg-surface-2 px-3 normal-case tracking-normal hover:bg-surface-3")}
          >
            <span className="text-brand-text">{t.token}</span>
            <span className="hidden text-muted-foreground sm:inline">{t.desc}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-5">
        {fields.map((f) => (
          <div key={f.key} className="grid grid-cols-1 gap-[2px] lg:grid-cols-2">
            <Field label={f.label} hint={f.hint} htmlFor={`msg-${f.key}`} className="bg-background p-3">
              <textarea
                id={`msg-${f.key}`}
                ref={refs[f.key]}
                rows={4}
                maxLength={600}
                value={s.messages[f.key]}
                onFocus={() => setFocus(f.key)}
                onChange={(e) => setMsg({ [f.key]: e.target.value })}
                className={cn(controlClass, "h-auto resize-y py-2.5 font-mono text-[13px] leading-relaxed")}
              />
              <button
                type="button"
                disabled={s.messages[f.key] === DEFAULT_MESSAGES[f.key]}
                onClick={() => setMsg({ [f.key]: DEFAULT_MESSAGES[f.key] })}
                className={cn(monoLabel, "press mt-1 flex h-9 w-fit items-center gap-1.5 px-1 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40")}
              >
                <RotateCcw aria-hidden className="size-3" /> Kembalikan default
              </button>
            </Field>
            {/* Pratinjau bergaya gelembung chat WhatsApp */}
            <div className="flex flex-col bg-background p-3">
              <p className={cn(monoLabel, "text-muted-foreground")}>
                Pratinjau{f.key === "order" && sample ? ` · ${sample.cat.name}` : ""}
              </p>
              <div className="mt-1.5 flex flex-1 items-start justify-end bg-[#efeae2] p-3 dark:bg-[#0b141a]">
                <p className="max-w-[90%] rounded-[10px] rounded-tr-none bg-[#d9fdd3] px-3 py-2 text-[14px] leading-snug whitespace-pre-wrap text-[#111b21] shadow-[0_1px_0.5px_rgb(0_0_0/0.13)] dark:bg-[#005c4b] dark:text-[#e9edef]">
                  {f.preview}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
