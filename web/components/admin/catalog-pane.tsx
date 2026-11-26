"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Check, ClipboardPaste, Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { Field, NumberInput, Segmented, controlClass } from "@/components/admin/fields";
import { IconButton, Panel, Toggle } from "@/components/admin/panel";
import { SaveBar, useSaver } from "@/components/admin/save-bar";
import { PromoBadge } from "@/components/price-tag";
import { Kbd, RobuxIcon, monoLabel, segButton } from "@/components/ui";
import {
  IN_STOCK,
  TOPUP_TYPE_KEYS,
  TOPUP_TYPES,
  parsePriceList,
  restockLabel,
  quote,
  toPriceListText,
  uid,
  type Catalog,
  type CatalogItem,
  type Category,
  type CustomPricing,
  type Promo,
} from "@/lib/catalog";
import { cn, num, rupiah } from "@/lib/utils";

function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const blankCategory = (): Category => ({
  id: `cat-${uid()}`,
  name: "Kategori baru",
  type: "username",
  summary: "",
  eta: "",
  notes: [],
  link: null,
  visible: false,
  stock: IN_STOCK,
  items: [],
  custom: { enabled: false, per: 100, price: null, min: 100, max: 10_000 },
});

export function CatalogPane({ initial, promo, active }: { initial: Catalog; promo: Promo; active: boolean }) {
  const [saved, setSaved] = useState(initial);
  const [categories, setCategories] = useState(initial.categories);
  const [selectedId, setSelectedId] = useState(initial.categories[0]?.id ?? "");
  const [copied, setCopied] = useState(false);

  const dirty = useMemo(() => JSON.stringify(categories) !== JSON.stringify(saved.categories), [categories, saved]);
  const onSaved = useCallback((data: Catalog) => {
    setSaved(data);
    setCategories(data.categories);
  }, []);
  const { state, save } = useSaver<Catalog>({ url: "/api/admin/catalog", body: { categories }, dirty, active, onSaved });

  const index = categories.findIndex((c) => c.id === selectedId);
  const selected = categories[index];
  const update = (patch: Partial<Category>) => setCategories((list) => list.map((c) => (c.id === selectedId ? { ...c, ...patch } : c)));

  const addCategory = () => {
    const c = blankCategory();
    setCategories((list) => [...list, c]);
    setSelectedId(c.id);
  };
  const removeCategory = () => {
    if (!selected || !confirm(`Hapus kategori "${selected.name}"? Permanen setelah disimpan.`)) return;
    const next = categories.filter((c) => c.id !== selectedId);
    setCategories(next);
    setSelectedId(next[Math.max(0, index - 1)]?.id ?? "");
  };
  const copyText = async () => {
    await navigator.clipboard.writeText(toPriceListText({ categories, updatedAt: "" }, promo));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="grid grid-cols-1 flex-1 gap-[2px] lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-[2px] lg:sticky lg:top-[calc(3.25rem+2px+2.75rem+2px)] lg:h-[calc(100dvh-3.25rem-2.75rem-4px-4rem)] lg:self-start">
        <div className={cn(monoLabel, "flex h-9 items-center justify-between bg-surface-2 px-3 text-muted-foreground")}>
          <span>Kategori</span>
          <Kbd>{categories.length}</Kbd>
        </div>
        <div className="flex flex-col gap-[2px] overflow-y-auto">
          {categories.map((c, i) => {
            const on = c.id === selectedId;
            const promoItems = c.items.filter((it) => it.promoPrice !== null && it.promoPrice < it.price).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={cn("press press-soft relative flex items-center gap-3 px-3 py-3 text-left", on ? "bg-surface-3" : "bg-surface hover:bg-surface-2")}
              >
                {on && <span className="absolute inset-y-0 left-0 w-[2px] bg-brand" />}
                <span className={cn(monoLabel, "w-5 text-brand-text")}>{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-[15px] font-medium", !c.visible && "text-muted-foreground line-through decoration-1")}>
                    {c.name || "Tanpa nama"}
                  </span>
                  <span className={cn(monoLabel, "block text-[10px] text-muted-foreground")}>
                    {TOPUP_TYPES[c.type].short} · {c.items.length} paket{c.custom.enabled ? " · custom" : ""}
                  </span>
                </span>
                {c.stock.soldOut && <Kbd className="bg-amber-500 text-black">Habis</Kbd>}
                {promoItems > 0 && <PromoBadge label={String(promoItems)} />}
                {!c.visible && <EyeOff className="size-3.5 shrink-0 text-muted-foreground" />}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={addCategory} className={cn(segButton, "justify-center")}>
          <Plus className="size-3.5" /> Kategori
        </button>
        <span className="hidden flex-1 bg-surface-2 lg:block" />
        <button type="button" onClick={copyText} className={cn(segButton, "justify-between")}>
          {copied ? "Tersalin" : "Salin daftar harga (WA)"}
          {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
        </button>
      </aside>

      {selected ? (
        <CategoryEditor
          key={selected.id}
          category={selected}
          promo={promo}
          index={index}
          total={categories.length}
          onChange={update}
          onMove={(to) => setCategories((list) => move(list, index, to))}
          onRemove={removeCategory}
        />
      ) : (
        <div className="grid place-items-center bg-surface p-10 text-muted-foreground">Belum ada kategori.</div>
      )}

      {active && <SaveBar dirty={dirty} state={state} onSave={save} onReset={() => setCategories(saved.categories)} savedNote="katalog sudah diperbarui" />}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CategoryEditor({
  category: c,
  promo,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  category: Category;
  promo: Promo;
  index: number;
  total: number;
  onChange: (patch: Partial<Category>) => void;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  const id = (k: string) => `${c.id}-${k}`;
  const [notesDraft, setNotesDraft] = useState(c.notes.join("\n"));

  return (
    <div className="flex min-w-0 flex-col gap-6 p-[2px] pt-0 sm:p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4 px-2 pt-4 sm:px-0 sm:pt-0">
        <div className="min-w-0">
          <p className={cn(monoLabel, "text-muted-foreground")}>
            {String(index + 1).padStart(2, "0")} / {TOPUP_TYPES[c.type].label}
          </p>
          <h1 className="mt-1 truncate text-[clamp(1.75rem,3vw,2.5rem)] leading-none font-semibold tracking-[-0.05em]">{c.name || "Tanpa nama"}</h1>
        </div>
        <div className="flex gap-[2px]">
          <IconButton label="Naikkan" disabled={index === 0} onClick={() => onMove(index - 1)}>
            <ArrowUp className="size-4" />
          </IconButton>
          <IconButton label="Turunkan" disabled={index === total - 1} onClick={() => onMove(index + 1)}>
            <ArrowDown className="size-4" />
          </IconButton>
          <button type="button" onClick={() => onChange({ visible: !c.visible })} className={cn(segButton, "h-10", c.visible && "text-foreground")}>
            {c.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            {c.visible ? "Tampil" : "Disembunyikan"}
          </button>
          <IconButton label="Hapus kategori" onClick={onRemove} danger>
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      </div>

      <StockPanel category={c} onChange={onChange} />

      <Panel title="Info">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Nama kategori" htmlFor={id("name")}>
            <input id={id("name")} value={c.name} maxLength={80} onChange={(e) => onChange({ name: e.target.value })} className={controlClass} />
          </Field>
          <Field label="Estimasi" hint="mis. Instan, 5 hari" htmlFor={id("eta")}>
            <input id={id("eta")} value={c.eta} maxLength={40} onChange={(e) => onChange({ eta: e.target.value })} className={controlClass} />
          </Field>
          <Field label="Jenis top up" className="md:col-span-2">
            <Segmented
              label="Jenis top up"
              value={c.type}
              onChange={(type) => onChange({ type })}
              options={TOPUP_TYPE_KEYS.map((k) => ({ value: k, label: TOPUP_TYPES[k].short, code: TOPUP_TYPES[k].code }))}
              className="max-sm:!grid-cols-2"
            />
          </Field>
          <Field label="Ringkasan" hint="1–2 kalimat" htmlFor={id("summary")} className="md:col-span-2">
            <textarea
              id={id("summary")}
              rows={2}
              maxLength={400}
              value={c.summary}
              onChange={(e) => onChange({ summary: e.target.value })}
              className={cn(controlClass, "h-auto resize-y py-2.5 leading-relaxed")}
            />
          </Field>
          <Field label="Catatan" hint="satu baris = satu catatan" htmlFor={id("notes")} className="md:col-span-2">
            <textarea
              id={id("notes")}
              rows={3}
              value={notesDraft}
              onChange={(e) => {
                setNotesDraft(e.target.value);
                onChange({ notes: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) });
              }}
              className={cn(controlClass, "h-auto resize-y py-2.5 leading-relaxed")}
            />
          </Field>
          <Field label="Link — label" htmlFor={id("link-label")}>
            <input
              id={id("link-label")}
              value={c.link?.label ?? ""}
              placeholder="Komunitas BASEMENT"
              onChange={(e) => onChange({ link: { label: e.target.value, url: c.link?.url ?? "" } })}
              className={controlClass}
            />
          </Field>
          <Field label="Link — URL" hint="kosongkan bila tidak ada" htmlFor={id("link-url")}>
            <input
              id={id("link-url")}
              type="url"
              value={c.link?.url ?? ""}
              placeholder="https://"
              onChange={(e) => onChange({ link: e.target.value || c.link?.label ? { label: c.link?.label ?? "", url: e.target.value } : null })}
              className={controlClass}
            />
          </Field>
        </div>
      </Panel>

      <ItemsEditor category={c} onChange={onChange} />
      <CustomEditor category={c} promo={promo} onChange={onChange} />
      <ImportPanel category={c} onChange={onChange} />
    </div>
  );
}

function ItemsEditor({ category: c, onChange }: { category: Category; onChange: (patch: Partial<Category>) => void }) {
  const setItem = (id: string, patch: Partial<CatalogItem>) => onChange({ items: c.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  const add = () => {
    const last = c.items.at(-1);
    onChange({ items: [...c.items, { id: uid(), robux: last?.robux ?? 100, label: "", price: 0, promoPrice: null }] });
  };
  const sortByRobux = () => onChange({ items: [...c.items].sort((a, b) => (a.robux ?? Infinity) - (b.robux ?? Infinity)) });
  const cols = "md:grid-cols-[2rem_7.5rem_minmax(0,1fr)_9rem_9rem_4.5rem_5.5rem]";

  return (
    <Panel
      title="Daftar paket"
      meta={<Kbd>{c.items.length}</Kbd>}
      actions={
        c.items.length > 1 ? (
          <button type="button" onClick={sortByRobux} className={cn(segButton, "h-10")}>
            <ArrowUpDown className="size-3.5" /> Urutkan
          </button>
        ) : undefined
      }
    >
      <p className="mb-4 text-[13px] text-muted-foreground">
        Isi <b className="text-foreground">Harga promo</b> untuk menampilkan harga coret di item itu. Kosongkan bila tidak promo.
      </p>
      <div className="flex flex-col gap-[2px]">
        <div className={cn(monoLabel, "hidden gap-[2px] text-[10px] text-muted-foreground md:grid", cols)}>
          <span />
          <span className="px-1">Robux</span>
          <span className="px-1">Label (non-Robux)</span>
          <span className="px-1">Harga</span>
          <span className="px-1 text-brand-text">Harga promo</span>
          <span className="px-1 text-right">Rp/Robux</span>
          <span />
        </div>

        {c.items.map((item, i) => {
          const effective = item.promoPrice && item.promoPrice < item.price ? item.promoPrice : item.price;
          const r = item.robux ? effective / item.robux : null;
          const badPromo = item.promoPrice !== null && item.promoPrice >= item.price;
          return (
            <div key={item.id} className={cn("grid grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)] gap-[2px]", cols)}>
              <span className={cn(monoLabel, "grid place-items-center bg-surface-2 text-[10px] text-muted-foreground max-md:row-span-3")}>{i + 1}</span>
              <NumberInput ariaLabel={`Robux baris ${i + 1}`} value={item.robux} allowEmpty placeholder="—" prefix={<RobuxIcon />} onChange={(robux) => setItem(item.id, { robux })} />
              <input
                aria-label={`Label baris ${i + 1}`}
                value={item.label}
                placeholder={item.robux === null ? "Nama item" : "opsional"}
                maxLength={60}
                onChange={(e) => setItem(item.id, { label: e.target.value })}
                className={controlClass}
              />
              <NumberInput
                ariaLabel={`Harga baris ${i + 1}`}
                value={item.price}
                prefix="Rp"
                onChange={(price) => setItem(item.id, { price: price ?? 0 })}
                className={cn(item.price === 0 && "[&_input]:shadow-[inset_0_0_0_1.5px_rgb(245_158_11)]")}
              />
              <NumberInput
                ariaLabel={`Harga promo baris ${i + 1}`}
                value={item.promoPrice}
                allowEmpty
                placeholder="—"
                prefix="Rp"
                onChange={(promoPrice) => setItem(item.id, { promoPrice })}
                className={cn(item.promoPrice !== null && !badPromo && "[&_input]:shadow-[inset_0_0_0_1.5px_var(--brand)]", badPromo && "[&_input]:shadow-[inset_0_0_0_1.5px_rgb(239_68_68)]")}
              />
              <span className={cn(monoLabel, "flex items-center justify-end bg-surface-2 px-2 text-[11px] text-muted-foreground tabular-nums")}>
                {r ? num(Math.round(r)) : "—"}
              </span>
              <span className="flex gap-[2px]">
                <IconButton label="Naikkan" disabled={i === 0} onClick={() => onChange({ items: move(c.items, i, i - 1) })}>
                  <ArrowUp className="size-3.5" />
                </IconButton>
                <IconButton label="Hapus baris" danger onClick={() => onChange({ items: c.items.filter((x) => x.id !== item.id) })}>
                  <Trash2 className="size-3.5" />
                </IconButton>
              </span>
            </div>
          );
        })}

        <button type="button" onClick={add} className={cn(segButton, "mt-[2px] justify-center border border-dashed border-border-strong bg-transparent")}>
          <Plus className="size-3.5" /> Tambah paket
        </button>
      </div>
    </Panel>
  );
}

function CustomEditor({ category: c, promo, onChange }: { category: Category; promo: Promo; onChange: (patch: Partial<Category>) => void }) {
  const set = (patch: Partial<CustomPricing>) => onChange({ custom: { ...c.custom, ...patch } });
  const fixed = c.custom.price !== null;
  const samples = [c.custom.min, 150, 750, 1_250, 3_333].filter((n, i, a) => n >= c.custom.min && n <= c.custom.max && a.indexOf(n) === i).slice(0, 4);

  return (
    <Panel title="Jumlah custom" meta={c.custom.enabled ? <Kbd className="bg-brand text-brand-foreground">Aktif</Kbd> : <Kbd>Mati</Kbd>}>
      <div className="flex flex-col gap-4">
        <Toggle
          checked={c.custom.enabled}
          onChange={(enabled) => set({ enabled })}
          label="Pembeli bisa ketik jumlah sendiri"
          description="Kalkulator muncul di katalog dan di cek harga beranda."
        />
        {c.custom.enabled && (
          <>
            <Field label="Cara hitung">
              <Segmented
                label="Cara hitung"
                value={fixed ? "fixed" : "auto"}
                onChange={(v) => set({ price: v === "fixed" ? (c.custom.price ?? 10_000) : null })}
                options={[
                  { value: "auto", label: "Ikut tarif paket" },
                  { value: "fixed", label: "Tarif tetap" },
                ]}
              />
            </Field>
            <p className="-mt-2 text-[13px] text-muted-foreground">
              {fixed
                ? "Harga = jumlah × (harga ÷ per). Contoh: Rp 10.000 per 100 → 150 Robux = Rp 15.000."
                : "Pakai tarif per Robux dari paket terbesar yang jumlahnya ≤ jumlah yang diketik. Makin banyak, makin murah."}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {fixed && (
                <>
                  <Field label="Harga">
                    <NumberInput value={c.custom.price} prefix="Rp" onChange={(price) => set({ price: price ?? 0 })} />
                  </Field>
                  <Field label="Per (Robux)">
                    <NumberInput value={c.custom.per} prefix={<RobuxIcon />} onChange={(per) => set({ per: per || 1 })} />
                  </Field>
                </>
              )}
              <Field label="Minimal">
                <NumberInput value={c.custom.min} prefix={<RobuxIcon />} onChange={(min) => set({ min: min || 1 })} />
              </Field>
              <Field label="Maksimal">
                <NumberInput value={c.custom.max} prefix={<RobuxIcon />} onChange={(max) => set({ max: max || 1 })} />
              </Field>
            </div>
            <div className="flex flex-col gap-[2px]">
              <p className={cn(monoLabel, "text-muted-foreground")}>Pratinjau</p>
              <div className="grid grid-cols-1 gap-[2px] sm:grid-cols-4">
                {samples.map((n) => {
                  const q = quote(c, n, promo);
                  return (
                    <div key={n} className="bg-surface-2 px-3 py-2.5">
                      <p className={cn(monoLabel, "text-[10px] text-muted-foreground")}>{num(n)} Robux</p>
                      <p className="font-semibold tabular-nums">{q ? rupiah(q.price) : "—"}</p>
                      {q?.original && <p className={cn(monoLabel, "text-[10px] text-muted-foreground line-through")}>{rupiah(q.original)}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}

function ImportPanel({ category: c, onChange }: { category: Category; onChange: (patch: Partial<Category>) => void }) {
  const [text, setText] = useState("");
  const parsed = useMemo(() => parsePriceList(text), [text]);

  const apply = (mode: "replace" | "append") => {
    onChange({ items: mode === "replace" ? parsed : [...c.items, ...parsed] });
    setText("");
  };

  return (
    <Panel title="Tempel dari WhatsApp" meta={parsed.length ? <Kbd>{parsed.length} terbaca</Kbd> : undefined}>
      <p className="mb-3 text-[13px] text-muted-foreground">
        Tempel daftar harga seperti <code className="font-mono text-foreground">✧ 80 ⏣ — Rp17.000</code>. Judul, garis, dan catatan diabaikan.
      </p>
      <textarea
        aria-label="Tempel daftar harga dari WhatsApp"
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"✧ 80 ⏣ — Rp17.000\n✧ 160 ⏣ — Rp30.000"}
        className={cn(controlClass, "h-auto resize-y py-2.5 font-mono text-[13px] leading-relaxed")}
      />
      {parsed.length > 0 && (
        <div className="mt-[2px] flex flex-col gap-[2px]">
          <div className={cn(monoLabel, "flex flex-wrap gap-x-4 gap-y-1 bg-surface-2 px-3 py-2.5 text-[11px] text-muted-foreground")}>
            {parsed.slice(0, 16).map((p) => (
              <span key={p.id}>
                <span className="text-foreground">{p.robux !== null ? `${num(p.robux)} Robux` : p.label}</span> {num(p.price)}
              </span>
            ))}
            {parsed.length > 16 && <span>+{parsed.length - 16}</span>}
          </div>
          <div className="grid grid-cols-2 gap-[2px]">
            <button type="button" onClick={() => apply("replace")} className={cn(segButton, "justify-center bg-brand text-brand-foreground hover:bg-brand hover:text-brand-foreground hover:brightness-115")}>
              <ClipboardPaste className="size-3.5" /> Ganti semua
            </button>
            <button type="button" onClick={() => apply("append")} className={cn(segButton, "justify-center")}>
              <Plus className="size-3.5" /> Tambahkan
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Stok: habis / tersedia + perkiraan ready                             */
/* ------------------------------------------------------------------ */

function StockPanel({ category: c, onChange }: { category: Category; onChange: (patch: Partial<Category>) => void }) {
  const stock = c.stock ?? IN_STOCK;
  const set = (patch: Partial<Category["stock"]>) => onChange({ stock: { ...stock, ...patch } });
  const id = (k: string) => `${c.id}-stock-${k}`;

  return (
    <Panel
      title="Stok"
      meta={stock.soldOut ? <Kbd className="bg-amber-500 text-black">Habis</Kbd> : <Kbd className="bg-success text-black">Tersedia</Kbd>}
    >
      <Toggle
        checked={stock.soldOut}
        onChange={(soldOut) => set({ soldOut })}
        label="Stok habis"
        description="Tombol beli diganti “Kabari saya saat ready”. Harga tetap terlihat, tapi tidak bisa dipesan."
      />
      {stock.soldOut && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[14rem_minmax(0,1fr)]">
          <Field label="Ready lagi" hint="opsional" htmlFor={id("date")}>
            <div className="flex gap-[2px]">
              <input
                id={id("date")}
                type="date"
                value={stock.restockAt}
                onChange={(e) => set({ restockAt: e.target.value })}
                className={controlClass}
              />
              {stock.restockAt && (
                <button
                  type="button"
                  onClick={() => set({ restockAt: "" })}
                  className={cn(segButton, "h-10 px-3")}
                  aria-label="Kosongkan tanggal"
                >
                  ×
                </button>
              )}
            </div>
          </Field>
          <Field label="Catatan untuk pembeli" hint={`${stock.note.length}/120`} htmlFor={id("note")}>
            <input
              id={id("note")}
              value={stock.note}
              maxLength={120}
              placeholder="mis. Menunggu payout grup berikutnya"
              onChange={(e) => set({ note: e.target.value })}
              className={controlClass}
            />
          </Field>
          <p className={cn(monoLabel, "flex items-center gap-2 text-muted-foreground md:col-span-2")}>
            <span className="block size-1.5 bg-amber-500" />
            Tampil di situs: <span className="text-foreground normal-case">{restockLabel(stock)}</span>
            {stock.note && <span className="truncate normal-case">· {stock.note}</span>}
          </p>
        </div>
      )}
    </Panel>
  );
}
