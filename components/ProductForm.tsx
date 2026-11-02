"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Upload, X, Loader2, Plus, Trash2, ImagePlus, GripVertical } from "lucide-react";
import { createProduct, updateProduct, Product, StockStatus, ConfigExtra, ConfigIncluded } from "@/lib/products";
import { Category, ensureDefaultCategories } from "@/lib/categories";
import { auth } from "@/lib/firebase";

interface Props {
  initial?: Product;
  mode: "create" | "edit";
}

function randomId() { return Math.random().toString(36).slice(2, 9); }

export default function ProductForm({ initial, mode }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [categories, setCategories] = useState<string[]>(
    initial?.categories?.length
      ? initial.categories
      : initial?.category
        ? [initial.category]
        : []
  );
  const [stockStatus, setStockStatus] = useState<StockStatus>(initial?.stockStatus ?? "in_stock");
  const [deliveryDays, setDeliveryDays] = useState(initial?.deliveryDays?.toString() ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [order, setOrder] = useState(initial?.order?.toString() ?? "");
  const [priceOnRequest, setPriceOnRequest] = useState(initial?.priceOnRequest ?? false);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    ensureDefaultCategories()
      .then((items) => {
        const active = items.filter((item) => item.active !== false);
        setAvailableCategories(active);
        setCategories((current) => current.length ? current : active[0] ? [active[0].slug] : []);
      })
      .catch(() => setError("No se pudieron cargar los rubros."));
  }, []);

  function toggleCategory(slug: string) {
    setCategories((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug]
    );
  }

  // Configurador
  const [configurable, setConfigurable] = useState(initial?.configurable ?? false);
  const [basePrintMinutes, setBasePrintMinutes] = useState(initial?.basePrintMinutes?.toString() ?? "");
  const [included, setIncluded] = useState<ConfigIncluded[]>(initial?.included ?? []);
  const [extras, setExtras] = useState<ConfigExtra[]>(
    (initial?.extras ?? []).map((e: any) => ({
      ...e,
      // migrar campo viejo image → images
      images: e.images ?? (e.image ? [e.image] : []),
    }))
  );

  // --- Included helpers ---
  function addIncluded() { setIncluded(p => [...p, { id: randomId(), name: "", qty: 1 }]); }
  function updateIncluded(id: string, field: keyof ConfigIncluded, val: any) {
    setIncluded(p => p.map(i => i.id === id ? { ...i, [field]: val } : i));
  }
  function removeIncluded(id: string) { setIncluded(p => p.filter(i => i.id !== id)); }

  // --- Extras helpers ---
  function addExtra() {
    setExtras(p => [...p, { id: randomId(), name: "", price: 0, printMinutes: 60, stockStatus: "days", maxQty: 5 }]);
  }
  function updateExtra(id: string, field: keyof ConfigExtra, val: any) {
    setExtras(p => p.map(e => e.id === id ? { ...e, [field]: val } : e));
  }
  function removeExtra(id: string) { setExtras(p => p.filter(e => e.id !== id)); }

  const imgDragIndex = useRef<number | null>(null);
  const imgDragOverIndex = useRef<number | null>(null);
  const extraDragIndex = useRef<number | null>(null);
  const extraDragOverIndex = useRef<number | null>(null);
  const extraFileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploadingExtra, setUploadingExtra] = useState<string | null>(null);

  async function uploadExtraImages(extraId: string, files: FileList) {
    setUploadingExtra(extraId);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }
    // Usar setter funcional para evitar stale closure
    setExtras(prev => prev.map(e =>
      e.id === extraId
        ? { ...e, images: [...(e.images || []), ...urls] }
        : e
    ));
    setUploadingExtra(null);
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }
    setImages(prev => [...prev, ...urls]);
    setUploading(false);
  }

  async function handleSubmit() {
    if (!name.trim() || (!priceOnRequest && !price) || categories.length === 0) { setError("Completá nombre, precio y al menos un rubro."); return; }
    setSaving(true);
    setError("");
    const data: any = {
      name: name.trim(),
      description: description.trim(),
      price: priceOnRequest ? (parseFloat(price) || 0) : parseFloat(price),
      categories,
      // Se conserva el primer rubro también en category para compatibilidad con datos/versiones anteriores.
      category: categories[0],
      stockStatus,
      active,
      order: order ? parseInt(order) : 999,
      priceOnRequest,
      images,
      configurable,
      ...(stockStatus === "days" && deliveryDays ? { deliveryDays: parseInt(deliveryDays) } : {}),
      ...(configurable ? {
        basePrintMinutes: parseInt(basePrintMinutes) || 0,
        included,
        extras,
      } : {}),
    };
    try {
      if (mode === "create") await createProduct(data);
      else await updateProduct(initial!.id!, data);
      router.push("/admin");
    } catch (e: any) {
      setError(`Error al guardar: ${e?.message || "Intentá de nuevo."}`);
      setSaving(false);
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand";
  const labelCls = "block text-xs font-medium text-gray-600 mb-1.5";

  return (
    <div className="max-w-xl">
      <div className="flex flex-col gap-5">

        {/* Nombre */}
        <div>
          <label className={labelCls}>Nombre del producto *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Pack Multiboard Starter" className={inputCls} />
        </div>

        {/* Descripción */}
        <div>
          <label className={labelCls}>Descripción</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción del producto..." rows={3} className={`${inputCls} resize-none`} />
        </div>

        {/* Precio + Categoría */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Precio base (ARS){!priceOnRequest && " *"}</label>
            {priceOnRequest ? (
              <div className="w-full border border-dashed border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 bg-gray-50">
                A consultar
              </div>
            ) : (
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="8500" className={inputCls} />
            )}
          </div>
          <div>
            <label className={labelCls}>Rubros *</label>
            <div className="border border-gray-200 rounded-xl p-3 bg-white min-h-[44px]">
              {availableCategories.length === 0 ? (
                <p className="text-xs text-gray-400">Cargando rubros...</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {availableCategories.map((c) => (
                    <label key={c.id || c.slug} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={categories.includes(c.slug)}
                        onChange={() => toggleCategory(c.slug)}
                        className="accent-brand w-4 h-4"
                      />
                      <span>{c.icon} {c.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <Link href="/admin/rubros" className="inline-block mt-2 text-xs text-brand hover:underline">
              Administrar rubros
            </Link>
          </div>
        </div>

        {/* Precio a consultar toggle */}
        <label className="flex items-center gap-3 cursor-pointer -mt-2">
          <div onClick={() => setPriceOnRequest(!priceOnRequest)}
            className={`w-10 h-5 rounded-full transition-colors relative ${priceOnRequest ? "bg-brand" : "bg-gray-200"}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${priceOnRequest ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm text-gray-600">Precio a consultar</span>
        </label>

        {/* Disponibilidad */}
        <div>
          <label className={labelCls}>Disponibilidad</label>
          <div className="flex gap-2 flex-wrap">
            {(["in_stock", "days", "unavailable"] as StockStatus[]).map(s => {
              const labels = { in_stock: "✅ En stock", days: "⏱ X días", unavailable: "🔴 Sin stock" };
              return (
                <button key={s} type="button" onClick={() => setStockStatus(s)}
                  className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${stockStatus === s ? "bg-brand text-white border-brand" : "bg-white text-gray-500 border-gray-200"}`}>
                  {labels[s]}
                </button>
              );
            })}
          </div>
          {stockStatus === "days" && (
            <input type="number" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)}
              placeholder="Días de entrega (ej: 7)" className={`mt-2 w-40 ${inputCls}`} />
          )}
        </div>

        {/* Fotos */}
        <div>
          <label className={labelCls}>Fotos</label>
          <div onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-brand/40 transition-colors">
            {uploading ? (
              <div className="flex items-center justify-center gap-2 text-brand"><Loader2 size={18} className="animate-spin" /> Subiendo...</div>
            ) : (
              <>
                <Upload size={20} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Hacé click para subir fotos</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — podés subir varias a la vez</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
          {images.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                <GripVertical size={11} /> Arrastrá para reordenar · La primera foto es la principal
              </p>
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <div
                    key={img}
                    draggable
                    onDragStart={() => { imgDragIndex.current = i; }}
                    onDragOver={e => { e.preventDefault(); imgDragOverIndex.current = i; }}
                    onDrop={() => {
                      const from = imgDragIndex.current;
                      const to = imgDragOverIndex.current;
                      if (from === null || to === null || from === to) return;
                      const reordered = [...images];
                      const [moved] = reordered.splice(from, 1);
                      reordered.splice(to, 0, moved);
                      setImages(reordered);
                      imgDragIndex.current = null;
                      imgDragOverIndex.current = null;
                    }}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-100 cursor-grab active:cursor-grabbing group"
                    style={{ borderColor: i === 0 ? "#6C47FF" : undefined }}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                    {i === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-brand/80 text-white text-[9px] text-center py-0.5 font-medium">
                        Principal
                      </div>
                    )}
                    <button
                      onClick={() => setImages(p => p.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ══ CONFIGURADOR ══ */}
        <div className="border border-gray-200 rounded-2xl p-4">
          <label className="flex items-center gap-3 cursor-pointer mb-1">
            <div onClick={() => setConfigurable(!configurable)}
              className={`w-10 h-5 rounded-full transition-colors relative ${configurable ? "bg-brand" : "bg-gray-200"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${configurable ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">Producto configurable</span>
          </label>
          <p className="text-xs text-gray-400 mb-4">El cliente puede agregar opciones y ver el precio y tiempo total.</p>

          {configurable && (
            <div className="flex flex-col gap-5 pt-2">

              {/* Tiempo base */}
              <div>
                <label className={labelCls}>Tiempo de impresión del pack base (minutos)</label>
                <input type="number" value={basePrintMinutes} onChange={e => setBasePrintMinutes(e.target.value)}
                  placeholder="Ej: 480 = 8hs" className={`w-48 ${inputCls}`} />
                {basePrintMinutes && <p className="text-xs text-gray-400 mt-1">≈ {Math.ceil(parseInt(basePrintMinutes)/480)} día{Math.ceil(parseInt(basePrintMinutes)/480) !== 1 ? "s" : ""} de impresión</p>}
              </div>

              {/* Incluidos */}
              <div>
                <label className={`${labelCls} mb-2`}>Ítems incluidos en el pack</label>
                <div className="flex flex-col gap-2">
                  {included.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input value={item.name} onChange={e => updateIncluded(item.id, "name", e.target.value)}
                        placeholder="Ej: Tablero 1400x800mm" className={`flex-1 ${inputCls}`} />
                      <input type="number" value={item.qty} onChange={e => updateIncluded(item.id, "qty", parseInt(e.target.value))}
                        className="w-16 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand text-center" min={1} />
                      <button onClick={() => removeIncluded(item.id)} className="p-2 text-gray-300 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  {included.length === 0 && <p className="text-xs text-gray-400 mb-1">Todavía no hay ítems incluidos.</p>}
                  <button onClick={addIncluded} type="button"
                    className="flex items-center gap-1 text-xs text-brand font-medium hover:underline mt-1 w-fit">
                    <Plus size={13} /> Agregar ítem
                  </button>
                </div>
              </div>

              {/* Adicionales */}
              <div>
                <label className={`${labelCls} mb-2`}>Adicionales opcionales</label>
                <div className="flex flex-col gap-3">
                  {extras.map((extra, index) => (
                    <div
                      key={extra.id}
                      draggable
                      onDragStart={() => { extraDragIndex.current = index; }}
                      onDragOver={e => { e.preventDefault(); extraDragOverIndex.current = index; }}
                      onDrop={() => {
                        const from = extraDragIndex.current;
                        const to = extraDragOverIndex.current;
                        if (from === null || to === null || from === to) return;
                        const reordered = [...extras];
                        const [moved] = reordered.splice(from, 1);
                        reordered.splice(to, 0, moved);
                        setExtras(reordered);
                        extraDragIndex.current = null;
                        extraDragOverIndex.current = null;
                      }}
                      className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical size={16} className="text-gray-300 flex-shrink-0" />
                        <input value={extra.name} onChange={e => updateExtra(extra.id, "name", e.target.value)}
                          placeholder="Ej: Soporte taladro" className={`flex-1 ${inputCls} bg-white`} />
                        <button onClick={() => removeExtra(extra.id)} className="p-2 text-gray-300 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      </div>

                      {/* Fotos del adicional */}
                      <div>
                        <label className="text-[10px] text-gray-400 mb-1.5 block">Fotos del adicional</label>
                        <div className="flex gap-2 flex-wrap">
                          {(extra.images || []).map((img, i) => (
                            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                              <Image src={img} alt="" fill className="object-cover" />
                              <button
                                onClick={() => updateExtra(extra.id, "images", (extra.images || []).filter((_, j) => j !== i))}
                                className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80">
                                <X size={9} />
                              </button>
                            </div>
                          ))}
                          <div
                            onClick={() => extraFileRefs.current[extra.id]?.click()}
                            className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-brand/40 transition-colors bg-white"
                          >
                            {uploadingExtra === extra.id
                              ? <Loader2 size={14} className="animate-spin text-brand" />
                              : <ImagePlus size={16} className="text-gray-300" />
                            }
                          </div>
                          <input
                            type="file" accept="image/*" multiple className="hidden"
                            ref={el => { extraFileRefs.current[extra.id] = el; }}
                            onChange={e => e.target.files?.length && uploadExtraImages(extra.id, e.target.files)}
                          />
                        </div>
                      </div>

                      {/* Precio a consultar toggle */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div onClick={() => updateExtra(extra.id, "priceOnRequest", !extra.priceOnRequest)}
                          className={`w-8 h-4 rounded-full transition-colors relative flex-shrink-0 ${extra.priceOnRequest ? "bg-brand" : "bg-gray-200"}`}>
                          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${extra.priceOnRequest ? "translate-x-4" : "translate-x-0.5"}`} />
                        </div>
                        <span className="text-[11px] text-gray-500">Precio a consultar</span>
                      </label>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-gray-400 mb-1 block">Precio (ARS)</label>
                          {extra.priceOnRequest ? (
                            <div className={`${inputCls} bg-gray-100 text-gray-400 text-xs`}>A consultar</div>
                          ) : (
                            <input type="number" value={extra.price} onChange={e => updateExtra(extra.id, "price", parseFloat(e.target.value))}
                              className={`${inputCls} bg-white`} placeholder="2500" />
                          )}
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 mb-1 block">Impresión (min)</label>
                          <input type="number" value={extra.printMinutes} onChange={e => updateExtra(extra.id, "printMinutes", parseInt(e.target.value))}
                            className={`${inputCls} bg-white`} placeholder="90" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 mb-1 block">Cant. máx</label>
                          <input type="number" value={extra.maxQty} onChange={e => updateExtra(extra.id, "maxQty", parseInt(e.target.value))}
                            className={`${inputCls} bg-white`} min={1} />
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {(["in_stock", "days", "unavailable"] as StockStatus[]).map(s => {
                          const labels = { in_stock: "En stock", days: "A pedido", unavailable: "Sin stock" };
                          return (
                            <button key={s} type="button" onClick={() => updateExtra(extra.id, "stockStatus", s)}
                              className={`px-3 py-1 rounded-full text-[10px] font-medium border transition-all ${extra.stockStatus === s ? "bg-brand text-white border-brand" : "bg-white text-gray-400 border-gray-200"}`}>
                              {labels[s]}
                            </button>
                          );
                        })}
                        {extra.printMinutes > 0 && (
                          <span className="text-[10px] text-gray-400 self-center ml-auto">
                            ≈ {extra.printMinutes >= 60 ? `${(extra.printMinutes/60).toFixed(1)}hs` : `${extra.printMinutes}min`}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {extras.length === 0 && <p className="text-xs text-gray-400 mb-1">Todavía no hay adicionales.</p>}
                  <button onClick={addExtra} type="button"
                    className="flex items-center gap-1 text-xs text-brand font-medium hover:underline mt-1 w-fit">
                    <Plus size={13} /> Agregar adicional
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orden */}
        <div>
          <label className={labelCls}>Orden en la tienda</label>
          <div className="flex items-center gap-3">
            <input
              type="number" value={order} onChange={e => setOrder(e.target.value)}
              placeholder="1" min={1}
              className={`w-24 ${inputCls}`}
            />
            <p className="text-xs text-gray-400">Número más bajo aparece primero. Dejalo vacío para que quede al final.</p>
          </div>
        </div>

        {/* Activo */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => setActive(!active)}
            className={`w-10 h-5 rounded-full transition-colors relative ${active ? "bg-brand" : "bg-gray-200"}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${active ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm text-gray-600">Visible en la tienda</span>
        </label>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 bg-brand text-white font-medium px-6 py-2.5 rounded-full text-sm hover:bg-brand-dark transition-colors disabled:opacity-50">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {mode === "create" ? "Publicar producto" : "Guardar cambios"}
          </button>
          <button onClick={() => router.push("/admin")} className="px-6 py-2.5 rounded-full text-sm text-gray-500 hover:bg-gray-100 transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
