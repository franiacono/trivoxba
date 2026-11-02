"use client";

import { DragEvent, useEffect, useMemo, useState } from "react";
import { GripVertical, ImagePlus, Images, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { Category, createCategory, deleteCategory, ensureDefaultCategories, slugifyCategoryName, updateCategory } from "@/lib/categories";
import { getAllProducts, Product } from "@/lib/products";

export default function RubrosPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [icon, setIcon] = useState("📦");
  const [label, setLabel] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [picking, setPicking] = useState<Category | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([ensureDefaultCategories(), getAllProducts()]);
      setCategories(c);
      setProducts(p);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function saveNew() {
    const cleanLabel = label.trim();
    const cleanIcon = icon.trim() || "📦";
    if (!cleanLabel) return setError("Escribí el nombre del rubro.");
    const slug = slugifyCategoryName(cleanLabel);
    if (!slug) return setError("El nombre del rubro no es válido.");
    if (categories.some((c) => c.slug === slug)) return setError("Ya existe un rubro con ese nombre.");
    setSaving(true); setError("");
    try {
      await createCategory({ label: cleanLabel, icon: cleanIcon, slug, active: true, order: categories.length + 1 });
      setLabel(""); setIcon("📦"); await load();
    } catch (e: any) { setError(e?.message || "No se pudo crear el rubro."); }
    finally { setSaving(false); }
  }

  async function uploadCategoryImage(category: Category, file?: File) {
    if (!category.id || !file) return;
    setUploadingId(category.id); setError("");
    try {
      const fd = new FormData(); fd.append("file", file);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/upload", { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
      const data = await res.json();
      if (!data.url) throw new Error(data.error || "No se pudo subir la imagen.");
      await updateCategory(category.id, { image: data.url }); setPicking(null); await load();
    } catch (e: any) { setError(e?.message || "No se pudo subir la imagen."); }
    finally { setUploadingId(null); }
  }

  async function chooseExisting(category: Category, url: string) {
    if (!category.id) return;
    setUploadingId(category.id);
    try { await updateCategory(category.id, { image: url }); setPicking(null); await load(); }
    finally { setUploadingId(null); }
  }

  async function saveEdit() {
    if (!editing?.id || !editing.label.trim()) return;
    setSaving(true); setError("");
    try {
      await updateCategory(editing.id, { label: editing.label.trim(), icon: editing.icon.trim() || "📦" });
      setEditing(null); await load();
    } catch (e: any) { setError(e?.message || "No se pudo guardar."); }
    finally { setSaving(false); }
  }

  async function removeCategory(category: Category) {
    if (!category.id) return;
    const used = products.filter((p) => (p.categories?.length ? p.categories : [p.category]).includes(category.slug));
    if (used.length) {
      setError(`No podés eliminar "${category.label}" porque está asignado a ${used.length} producto${used.length === 1 ? "" : "s"}. Primero quitá ese rubro de esos productos.`);
      return;
    }
    if (!confirm(`¿Eliminar el rubro "${category.label}"?`)) return;
    setSaving(true);
    try { await deleteCategory(category.id); await load(); }
    finally { setSaving(false); }
  }

  async function moveCategory(targetId: string) {
    if (!draggingId || draggingId === targetId) return setDraggingId(null);
    const from = categories.findIndex((c) => c.id === draggingId);
    const to = categories.findIndex((c) => c.id === targetId);
    if (from < 0 || to < 0) return setDraggingId(null);
    const reordered = [...categories];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setCategories(reordered);
    setDraggingId(null);
    try {
      await Promise.all(reordered.map((category, index) => category.id ? updateCategory(category.id, { order: index + 1 }) : Promise.resolve()));
    } catch {
      setError("No se pudo guardar el nuevo orden de los rubros.");
      await load();
    }
  }

  const availableImages = useMemo(() => {
    if (!picking) return [];
    const urls = products
      .filter((p) => (p.categories?.length ? p.categories : [p.category]).includes(picking.slug))
      .flatMap((p) => p.images || []).filter(Boolean);
    return Array.from(new Set(urls));
  }, [picking, products]);

  return <div className="max-w-3xl">
    <div className="mb-6">
      <h1 className="text-xl font-semibold text-gray-900">Rubros</h1>
      <p className="text-sm text-gray-400 mt-1">Arrastrá los rubros para definir su orden. También podés elegir qué foto mostrar en la Home.</p>
    </div>

    <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6">
      <p className="text-xs font-medium text-gray-600 mb-3">Nuevo rubro</p>
      <div className="flex gap-2">
        <input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-16 border border-gray-200 rounded-xl px-3 py-2.5 text-center" placeholder="📦" maxLength={8}/>
        <input value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveNew()} className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand" placeholder="Ej: Cocina"/>
        <button onClick={saveNew} disabled={saving} className="flex items-center gap-1.5 bg-brand text-white px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"><Plus size={15}/> Crear</button>
      </div>
    </div>

    {error && <div className="mb-4 rounded-xl bg-red-50 text-red-600 text-xs px-4 py-3">{error}</div>}

    {loading ? <div className="flex justify-center py-12 text-brand"><Loader2 className="animate-spin"/></div> :
      <div className="flex flex-col gap-2">
        {categories.map((category) => <div
          key={category.id || category.slug}
          draggable={!!category.id && editing?.id !== category.id}
          onDragStart={(e: DragEvent<HTMLDivElement>) => { setDraggingId(category.id || null); e.dataTransfer.effectAllowed = "move"; }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => category.id && moveCategory(category.id)}
          onDragEnd={() => setDraggingId(null)}
          className={`bg-white border rounded-xl p-3 transition-all ${draggingId === category.id ? "opacity-40 border-brand" : "border-gray-100"}`}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-gray-300 cursor-grab active:cursor-grabbing px-1" title="Arrastrar para ordenar"><GripVertical size={18}/></div>
            {editing?.id === category.id ? <>
              <input value={editing?.icon ?? ""} onChange={(e) => setEditing((current) => current ? { ...current, icon: e.target.value } : current)} className="w-14 border border-gray-200 rounded-lg px-2 py-2 text-center"/>
              <input value={editing?.label ?? ""} onChange={(e) => setEditing((current) => current ? { ...current, label: e.target.value } : current)} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"/>
              <button onClick={saveEdit} className="p-2 text-brand"><Save size={16}/></button>
              <button onClick={() => setEditing(null)} className="p-2 text-gray-400"><X size={16}/></button>
            </> : <>
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                {category.image ? <Image src={category.image} alt={category.label} fill className="object-cover"/> : <div className="w-full h-full flex items-center justify-center text-xl">{category.icon}</div>}
              </div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-800">{category.label}</p><p className="text-[10px] text-gray-400 truncate">/categoria/{category.slug}</p></div>
              <button title="Elegir entre fotos de este rubro" onClick={() => { setPicking(picking?.id === category.id ? null : category); setError(""); }} className={`p-2 ${picking?.id === category.id ? "text-brand bg-orange-50 rounded-lg" : "text-gray-400 hover:text-brand"}`}><Images size={16}/></button>
              <label title="Subir otra imagen" className="p-2 text-gray-400 hover:text-brand cursor-pointer">{uploadingId === category.id ? <Loader2 size={15} className="animate-spin"/> : <ImagePlus size={15}/>}<input type="file" accept="image/*" className="hidden" onChange={(e) => uploadCategoryImage(category, e.target.files?.[0])}/></label>
              <button onClick={() => { setEditing(category); setPicking(null); setError(""); }} className="p-2 text-gray-400 hover:text-brand"><Pencil size={15}/></button>
              <button onClick={() => removeCategory(category)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={15}/></button>
            </>}
          </div>

          {picking?.id === category.id && <div className="mt-3 pt-3 border-t border-gray-100 ml-7">
            <div className="flex items-center justify-between mb-2"><div><p className="text-xs font-medium text-gray-700">Elegí una foto existente</p><p className="text-[10px] text-gray-400">Se muestran las fotos de los productos asignados a {category.label}.</p></div><button onClick={() => setPicking(null)} className="p-1 text-gray-400"><X size={15}/></button></div>
            {availableImages.length ? <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">{availableImages.map((url) => <button key={url} onClick={() => chooseExisting(category, url)} className={`relative aspect-square rounded-lg overflow-hidden border-2 ${category.image === url ? "border-brand" : "border-transparent hover:border-orange-200"}`}><Image src={url} alt="" fill className="object-cover"/></button>)}</div> : <p className="text-xs text-gray-400 py-3">Este rubro todavía no tiene productos con fotos.</p>}
          </div>}
        </div>)}
      </div>}
  </div>;
}
