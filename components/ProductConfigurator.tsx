"use client";
import { useState } from "react";
import { Plus, Minus, ShoppingCart, MessageCircle, CheckCircle, XCircle, ZoomIn } from "lucide-react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Product, ConfigExtra } from "@/lib/products";
import { useCart } from "@/lib/cart";

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || "5491150241776";



export default function ProductConfigurator({ product }: { product: Product }) {
  const { add } = useCart();
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries((product.extras || []).map(e => [e.id, 0]))
  );
  const [addedToCart, setAddedToCart] = useState(false);
  const [lightbox, setLightbox] = useState<{ open: boolean; slides: { src: string }[]; index: number }>({
    open: false, slides: [], index: 0
  });

  function setQty(id: string, val: number) {
    const extra = product.extras!.find(e => e.id === id)!;
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, Math.min(val, extra.maxQty)) }));
  }

  const selectedExtras = (product.extras || []).filter(e => quantities[e.id] > 0);
  const hasPriceOnRequest =
    product.priceOnRequest || selectedExtras.some((e) => e.priceOnRequest);

  const totalPrice =
    product.price +
    selectedExtras.reduce(
      (s, e) => s + (e.priceOnRequest ? 0 : e.price * quantities[e.id]),
      0
    );

  function openLightbox(images: string[], index = 0) {
    setLightbox({ open: true, slides: images.map(src => ({ src })), index });
  }

  function buildWAMessage() {
    const lines = [`Hola! Me interesa armar un pedido de *${product.name}*`];
    lines.push(`\n*Pack base incluye:*`);
    (product.included || []).forEach(i => lines.push(`  • ${i.qty}x ${i.name}`));
    if (selectedExtras.length > 0) {
      lines.push(`\n*Adicionales:*`);
      selectedExtras.forEach(e => lines.push(`  • ${quantities[e.id]}x ${e.name} — $${(e.price * quantities[e.id]).toLocaleString("es-AR")}`));
    }
    if (hasPriceOnRequest) {
      lines.push(`\n*Precio: a consultar*`);
    } else {
      lines.push(`\n*Total estimado: $${totalPrice.toLocaleString("es-AR")}*`);
    }
    lines.push(`*Entrega a coordinar por WhatsApp*`);
    lines.push(`\nhttps://entresd.com.ar/producto/${product.id}`);
    return lines.join("\n");
  }

  function handleAddToCart() {
    const name = selectedExtras.length > 0
      ? `${product.name} + ${selectedExtras.length} adicional${selectedExtras.length > 1 ? "es" : ""}`
      : product.name;
    add({ id: product.id!, name, price: totalPrice, image: product.images?.[0] });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  const stockBadge = (s: ConfigExtra["stockStatus"]) => ({
    in_stock: <span className="flex items-center gap-1 text-[10px] text-emerald-700"><CheckCircle size={10} /> En stock</span>,
    days: <span className="flex items-center gap-1 text-[10px] text-amber-600">⏱ A pedido</span>,
    unavailable: <span className="flex items-center gap-1 text-[10px] text-red-400"><XCircle size={10} /> Sin stock</span>,
  }[s]);

  return (
    <div className="flex flex-col gap-5">

      {/* Pack incluido */}
      {(product.included || []).length > 0 && (
        <div className="bg-brand/5 rounded-2xl p-4 border border-brand/10">
          <p className="text-xs font-semibold text-brand mb-3 uppercase tracking-wide">Incluido en el pack</p>
          <ul className="flex flex-col gap-1.5">
            {product.included!.map(item => (
              <li key={item.id} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full bg-brand/10 text-brand text-[10px] font-bold flex items-center justify-center flex-shrink-0">{item.qty}</span>
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Adicionales */}
      {(product.extras || []).length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Adicionales opcionales</p>
          <div className="flex flex-col gap-3">
            {product.extras!.map(extra => {
              const qty = quantities[extra.id];
              const unavailable = extra.stockStatus === "unavailable";
              const imgs = extra.images || [];
              return (
                <div key={extra.id} className={`p-3 rounded-xl border transition-colors ${qty > 0 ? "border-brand/30 bg-brand/5" : "border-gray-100 bg-white"} ${unavailable ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-3">
                    {/* Fotos — muestra hasta 3 thumbs */}
                    {imgs.length > 0 && (
                      <div className="flex gap-1 flex-shrink-0">
                        {imgs.slice(0, 3).map((img, i) => (
                          <div
                            key={i}
                            className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-100 cursor-zoom-in group"
                            onClick={() => openLightbox(imgs, i)}
                          >
                            <Image src={img} alt={extra.name} fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <ZoomIn size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {i === 2 && imgs.length > 3 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">+{imgs.length - 3}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{extra.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {extra.priceOnRequest ? (
                          <span className="text-xs text-gray-400 italic">Precio a consultar</span>
                        ) : (
                          <span className="text-xs text-brand font-semibold">${extra.price.toLocaleString("es-AR")} c/u</span>
                        )}
                        {stockBadge(extra.stockStatus)}
                      </div>
                    </div>

                    {extra.priceOnRequest ? (
                      <a
                        href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hola! Me interesa consultar el precio de: *${extra.name}* (adicional del pack *${product.name}*)`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-wa/10 text-wa text-xs font-medium px-3 py-1.5 rounded-full hover:bg-wa/20 transition-colors flex-shrink-0"
                      >
                        <MessageCircle size={11} /> Consultar
                      </a>
                    ) : (
                      <div className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-1 flex-shrink-0">
                        <button disabled={unavailable || qty === 0} onClick={() => setQty(extra.id, qty - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 disabled:opacity-30 transition-colors text-gray-500">
                          <Minus size={11} />
                        </button>
                        <span className="text-sm font-semibold w-5 text-center text-gray-800">{qty}</span>
                        <button disabled={unavailable || qty >= extra.maxQty} onClick={() => setQty(extra.id, qty + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 disabled:opacity-30 transition-colors text-gray-500">
                          <Plus size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resumen */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-500">
            {hasPriceOnRequest ? "Precio" : "Total estimado"}
          </span>
          {hasPriceOnRequest ? (
            <span className="text-base font-medium text-gray-500 italic">
              A consultar
            </span>
          ) : (
            <span className="text-2xl font-bold text-brand">
              ${totalPrice.toLocaleString("es-AR")}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">
          Entrega a coordinar por WhatsApp según disponibilidad.
        </p>
      </div>

      {!hasPriceOnRequest && (
        <button onClick={handleAddToCart}
          className={`flex items-center justify-center gap-2 font-medium px-6 py-3.5 rounded-full text-sm transition-all ${addedToCart ? "bg-emerald-500 text-white" : "bg-brand text-white hover:bg-brand-dark"}`}>
          <ShoppingCart size={16} />
          {addedToCart ? "¡Agregado al carrito!" : "Agregar al carrito"}
        </button>
      )}

      <a href={`https://wa.me/${WA}?text=${encodeURIComponent(buildWAMessage())}`}
        target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-wa/10 text-wa font-medium px-6 py-3 rounded-full text-sm hover:bg-wa/20 transition-colors">
        <MessageCircle size={16} /> Consultar por WhatsApp
      </a>

      <p className="text-xs text-gray-400 text-center">
        Los tiempos son estimados. Te confirmamos disponibilidad y fechas por WhatsApp.
      </p>

      {/* Lightbox */}
      <Lightbox
        open={lightbox.open}
        close={() => setLightbox(l => ({ ...l, open: false }))}
        slides={lightbox.slides}
        index={lightbox.index}
      />
    </div>
  );
}
