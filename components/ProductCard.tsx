"use client";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Clock, CheckCircle, XCircle, ShoppingCart, Check } from "lucide-react";
import { Product, productPath } from "@/lib/products";
import { waProductLink } from "@/lib/whatsapp";
import { useCart } from "@/lib/cart";
import { useState } from "react";

export default function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0];
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    add({ id: product.id!, name: product.name, price: product.price, image: img });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const badge = {
    in_stock: { label: "En stock", color: "bg-emerald-50 text-emerald-700", icon: <CheckCircle size={11} /> },
    days: { label: "A pedido", color: "bg-amber-50 text-amber-700", icon: <Clock size={11} /> },
    unavailable: { label: "Sin stock", color: "bg-red-50 text-red-500", icon: <XCircle size={11} /> },
  }[product.stockStatus];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-brand/40 hover:shadow-md transition-all group">
      <Link href={productPath(product)}>
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {img ? (
            <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <span className="text-5xl">🖨️</span>
            </div>
          )}
          <span className={`absolute top-2 left-2 flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${badge.color}`}>
            {badge.icon} {badge.label}
          </span>
        </div>
      </Link>

      <div className="p-3">
        <Link href={productPath(product)}>
          <h3 className="font-medium text-sm text-gray-900 mb-1 leading-tight line-clamp-1 hover:text-brand transition-colors">{product.name}</h3>
          <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
            {(product.description || "").replace(/\*\*/g, "").replace(/#{1,6}\s/g, "")}
          </p>
        </Link>
        <div className="flex flex-col gap-2">
          {product.priceOnRequest ? (
            <>
              <span className="text-xs font-medium text-gray-400 italic">Precio a consultar</span>
              <a
                href={waProductLink(product.name, 0, product.id)}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 bg-wa text-white text-xs font-medium px-3 py-2 rounded-full hover:opacity-90 transition-opacity w-full"
              >
                <MessageCircle size={12} /> Consultar
              </a>
            </>
          ) : (
            <>
              <span className="text-brand font-semibold text-base">${product.price.toLocaleString("es-AR")}</span>
              <button
                onClick={handleAdd}
                disabled={product.stockStatus === "unavailable"}
                className={`flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full transition-all w-full ${
                  added ? "bg-emerald-500 text-white"
                  : product.stockStatus === "unavailable" ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-brand text-white hover:bg-brand-dark"
                }`}
              >
                {added ? <Check size={12} /> : <ShoppingCart size={12} />}
                {added ? "¡Listo!" : "Agregar"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
