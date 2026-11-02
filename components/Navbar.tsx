"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";


export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs leading-none">E3D</span>
          </div>
          <span className="font-bold text-lg text-white leading-none">
            Entres<span className="text-brand">D</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          <Link href="/productos" className="text-sm text-gray-300 hover:text-white transition-colors">
            Productos
          </Link>
          <Link href="/pedidos-personalizados" className="text-sm text-gray-300 hover:text-white transition-colors">
            Pedidos personalizados
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/carrito" className="relative p-2.5 rounded-full hover:bg-white/10 transition-colors">
            <ShoppingCart size={19} className="text-gray-200" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
          <button
            className="md:hidden p-2 rounded-full hover:bg-white/10"
            onClick={() => setOpen(!open)}
            aria-label="Abrir menú"
          >
            {open ? <X size={19} className="text-white" /> : <Menu size={19} className="text-white" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-gray-950 border-t border-white/10 px-4 py-4 flex flex-col gap-3">
          <Link href="/productos" className="text-sm text-gray-200 py-1" onClick={() => setOpen(false)}>Productos</Link>
          <Link href="/pedidos-personalizados" className="text-sm text-gray-200 py-1" onClick={() => setOpen(false)}>
            Pedidos personalizados
          </Link>
        </div>
      )}
    </nav>
  );
}
