"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, MessageCircle } from "lucide-react";
import { getProducts, Product } from "@/lib/products";
import { Category, getCategories } from "@/lib/categories";
import ProductCard from "@/components/ProductCard";
import CategoryPills from "@/components/CategoryPills";

export default function CategoryClient({ slug }: { slug: string }) {
  const [cat, setCat] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getCategories(), getProducts(slug)])
      .then(([categories, items]) => {
        setCat(categories.find((c) => c.slug === slug) || null);
        setProducts(items);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8"><CategoryPills /></div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-brand"><Loader2 size={28} className="animate-spin" /></div>
      ) : !cat ? (
        <div className="text-center py-20 text-gray-400"><div className="text-5xl mb-3">🔎</div><p className="text-sm">Este rubro no existe.</p></div>
      ) : (
        <>
          <div className="mb-8">
            <span className="text-brand text-xs font-semibold uppercase tracking-[0.16em]">Explorá por rubro</span>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-950 mt-2">{cat.icon} {cat.label}</h1>
          </div>
          {products.length === 0 ? (
            <div className="overflow-hidden rounded-3xl bg-gray-950 text-white px-6 py-10 md:px-10 md:py-12">
              <div className="text-4xl mb-5">{cat.icon}</div>
              <p className="text-brand text-xs font-semibold uppercase tracking-[0.16em]">Próximamente</p>
              <h2 className="text-2xl md:text-3xl font-semibold mt-2">Estamos preparando productos para este rubro.</h2>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed mt-4 max-w-2xl">Todavía no publicamos productos en {cat.label}, pero estamos trabajando para sumar nuevas opciones. Mientras tanto, podés explorar el catálogo o contarnos qué necesitás.</p>
              <div className="flex flex-col sm:flex-row gap-3 mt-7">
                <Link href="/productos" className="inline-flex items-center justify-center gap-2 bg-brand text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-brand-dark transition-colors">Ver otros productos <ArrowRight size={16}/></Link>
                <Link href="/pedidos-personalizados" className="inline-flex items-center justify-center gap-2 border border-white/15 bg-white/5 text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"><MessageCircle size={16}/> Pedidos personalizados</Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          )}
        </>
      )}
    </div>
  );
}
