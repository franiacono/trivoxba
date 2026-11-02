"use client";
import { useEffect, useState, useRef } from "react";
import { getAllProducts, deleteProduct, updateProduct, Product } from "@/lib/products";
import { Category, getCategories } from "@/lib/categories";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, GripVertical, Star, Sparkles, ImageIcon } from "lucide-react";

type Filter = "todos" | "active" | "in_stock" | "days" | "unavailable" | "hidden";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "todos", label: "Todos" }, { key: "active", label: "✅ Publicados" }, { key: "hidden", label: "👁️ Ocultos" },
  { key: "in_stock", label: "📦 En stock" }, { key: "days", label: "⏱ X días" }, { key: "unavailable", label: "🔴 Sin stock" },
];

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<Filter>("todos");
  const [saving, setSaving] = useState(false);
  const [savingHome, setSavingHome] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  async function load() {
    setLoading(true);
    const [p, c] = await Promise.all([getAllProducts(), getCategories(true)]);
    setProducts(p); setCategories(c); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, name: string) { if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return; await deleteProduct(id); load(); }
  async function toggleActive(p: Product) { await updateProduct(p.id!, { active: !p.active }); setProducts(current => current.map(x => x.id === p.id ? { ...x, active: !p.active } : x)); }

  async function toggleHomeFlag(p: Product, field: "featured" | "novelty") {
    if (!p.id) return;
    setSavingHome(`${p.id}-${field}`);
    const value = !p[field];
    setProducts(current => current.map(x => x.id === p.id ? { ...x, [field]: value } : x));
    try { await updateProduct(p.id, { [field]: value }); } finally { setSavingHome(null); }
  }

  async function selectHero(p: Product) {
    if (!p.id || p.hero) return;
    if (!p.images?.[0]) { alert("Este producto no tiene una foto para usar como portada."); return; }
    setSavingHome(`${p.id}-hero`);
    const previous = products.filter(x => x.hero && x.id && x.id !== p.id);
    setProducts(current => current.map(x => ({ ...x, hero: x.id === p.id })));
    try {
      await Promise.all([...previous.map(x => updateProduct(x.id!, { hero: false })), updateProduct(p.id, { hero: true })]);
    } finally { setSavingHome(null); }
  }

  function onDragStart(index: number) { dragIndex.current = index; }
  function onDragOver(e: React.DragEvent, index: number) { e.preventDefault(); dragOverIndex.current = index; }
  async function onDrop() {
    const from = dragIndex.current, to = dragOverIndex.current;
    if (from === null || to === null || from === to) return;
    const reordered = [...products]; const [moved] = reordered.splice(from, 1); reordered.splice(to, 0, moved);
    const updated = reordered.map((p, i) => ({ ...p, order: i + 1 })); setProducts(updated); setSaving(true);
    await Promise.all(updated.map(p => updateProduct(p.id!, { order: p.order }))); setSaving(false); dragIndex.current = null; dragOverIndex.current = null;
  }

  const cat = (slug: string) => categories.find(c => c.slug === slug);
  const productCategorySlugs = (p: Product) => p.categories?.length ? p.categories : p.category ? [p.category] : [];
  const filtered = products.filter(p => filter === "todos" ? true : filter === "active" ? p.active : filter === "hidden" ? !p.active : p.stockStatus === filter);
  const stockBadge = (p: Product) => p.stockStatus === "in_stock" ? <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">En stock</span> : p.stockStatus === "days" ? <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{p.deliveryDays ?? "?"} días</span> : <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Sin stock</span>;
  const isFiltering = filter !== "todos";

  const homeButton = (active: boolean, busy: boolean, icon: React.ReactNode, label: string, onClick: () => void, exclusive = false) => (
    <button type="button" onClick={onClick} disabled={busy} title={label} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors disabled:opacity-50 ${active ? (exclusive ? "bg-gray-900 border-gray-900 text-white" : "bg-orange-50 border-orange-200 text-orange-700") : "bg-white border-gray-200 text-gray-400 hover:border-brand/40 hover:text-brand"}`}>
      {busy ? <Loader2 size={13} className="animate-spin"/> : icon}<span className="hidden xl:inline">{label}</span>
    </button>
  );

  return <div>
    <div className="flex items-center justify-between mb-5"><div className="flex items-center gap-3"><h1 className="text-xl font-semibold text-gray-900">Productos</h1>{saving && <span className="flex items-center gap-1.5 text-xs text-brand"><Loader2 size={12} className="animate-spin"/> Guardando orden...</span>}</div><Link href="/admin/nuevo" className="flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-brand-dark"><Plus size={15}/> Nuevo</Link></div>
    <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-5"><p className="text-xs font-medium text-gray-700">Control de la página principal</p><p className="text-[11px] text-gray-400 mt-1">⭐ y ✨ permiten varios productos. 🖼️ Portada es única: al elegir otra, reemplaza la anterior.</p></div>
    <div className="flex gap-2 flex-wrap mb-5">{FILTERS.map(f => <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${filter === f.key ? "bg-brand text-white border-brand" : "bg-white text-gray-500 border-gray-200"}`}>{f.label}</button>)}</div>
    {!isFiltering && !loading && products.length > 1 && <p className="text-xs text-gray-400 mb-3 flex items-center gap-1"><GripVertical size={12}/> Arrastrá los productos para cambiar el orden en la tienda</p>}
    {loading ? <div className="flex justify-center py-16 text-brand"><Loader2 size={24} className="animate-spin"/></div> : filtered.length === 0 ? <div className="text-center py-20 text-gray-400"><div className="text-5xl mb-3">📦</div><p className="text-sm">No hay productos con este filtro.</p></div> : <div className="flex flex-col gap-3">{filtered.map(p => <div key={p.id} draggable={!isFiltering} onDragStart={() => onDragStart(products.indexOf(p))} onDragOver={e => onDragOver(e, products.indexOf(p))} onDrop={onDrop} className={`bg-white rounded-2xl border p-4 flex flex-col md:flex-row md:items-center gap-3 ${p.active ? "border-gray-100" : "border-dashed border-gray-200 opacity-60"} ${!isFiltering ? "cursor-grab active:cursor-grabbing" : ""}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {!isFiltering && <div className="text-gray-300 flex-shrink-0"><GripVertical size={18}/></div>}
        {!isFiltering && <span className="text-xs text-gray-300 font-mono w-4 flex-shrink-0 text-center">{p.order ?? "—"}</span>}
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">{p.images?.[0] ? <Image src={p.images[0]} alt={p.name} fill className="object-cover"/> : <div className="w-full h-full flex items-center justify-center text-2xl">🖨️</div>}</div>
        <div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><p className="font-medium text-sm text-gray-900 truncate">{p.name}</p>{!p.active && <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Oculto</span>}{stockBadge(p)}</div><p className="text-xs text-gray-400 mt-0.5">{productCategorySlugs(p).map(slug => { const c=cat(slug); return c ? `${c.icon} ${c.label}` : slug; }).join(" · ")} · {p.priceOnRequest ? "Precio a consultar" : `$${p.price.toLocaleString("es-AR")}`}</p></div>
      </div>
      <div className="flex items-center justify-between md:justify-end gap-2 md:flex-shrink-0 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
        <div className="flex gap-1.5">
          {homeButton(!!p.featured, savingHome === `${p.id}-featured`, <Star size={13}/>, "Destacado", () => toggleHomeFlag(p,"featured"))}
          {homeButton(!!p.novelty, savingHome === `${p.id}-novelty`, <Sparkles size={13}/>, "Novedad", () => toggleHomeFlag(p,"novelty"))}
          {homeButton(!!p.hero, savingHome === `${p.id}-hero`, <ImageIcon size={13}/>, "Portada", () => selectHero(p), true)}
        </div>
        <div className="flex items-center gap-1"><button onClick={() => toggleActive(p)} title={p.active ? "Ocultar" : "Publicar"} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">{p.active ? <Eye size={15}/> : <EyeOff size={15}/>}</button><Link href={`/admin/editar/${p.id}`} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-brand"><Pencil size={15}/></Link><button onClick={() => handleDelete(p.id!,p.name)} className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={15}/></button></div>
      </div>
    </div>)}</div>}
  </div>;
}
