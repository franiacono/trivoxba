"use client";
import { useCart } from "@/lib/cart";
import { waCartLink } from "@/lib/whatsapp";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingCart, MessageCircle, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const { items, remove, updateQty, clear, total, count } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-400 text-sm mb-6">Agregá productos desde la tienda.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-brand text-white font-medium px-6 py-3 rounded-full text-sm hover:bg-brand-dark transition-colors">
            <ArrowLeft size={15} /> Ver productos
          </Link>
        </div>
      </div>
    );
  }

  const waLink = waCartLink(items.map((i) => ({ name: i.name, price: i.price, qty: i.qty })));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Carrito <span className="text-gray-400 font-normal text-base">({count} {count === 1 ? "producto" : "productos"})</span>
          </h1>
          <button onClick={clear} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
            Vaciar
          </button>
        </div>

        {/* Items */}
        <div className="flex flex-col gap-3 mb-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🖨️</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link href={`/producto/${item.id}`} className="font-medium text-sm text-gray-900 hover:text-brand transition-colors line-clamp-1">
                  {item.name}
                </Link>
                <p className="text-brand font-semibold text-sm mt-0.5">
                  ${(item.price * item.qty).toLocaleString("es-AR")}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-1">
                  <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-500">
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-medium w-5 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-500">
                    <Plus size={12} />
                  </button>
                </div>
                <button onClick={() => remove(item.id)} className="p-1.5 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Total estimado</span>
            <span className="text-2xl font-semibold text-brand">${total.toLocaleString("es-AR")}</span>
          </div>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            Los precios son orientativos. El vendedor te confirmará disponibilidad, tiempo de entrega y forma de pago por WhatsApp.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-wa text-white font-medium px-6 py-3.5 rounded-full text-sm hover:opacity-90 transition-opacity w-full"
          >
            <MessageCircle size={18} /> Enviar pedido por WhatsApp
          </a>
          <Link href="/" className="flex items-center justify-center gap-2 text-gray-400 text-sm mt-3 hover:text-gray-700 transition-colors">
            <ArrowLeft size={14} /> Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
