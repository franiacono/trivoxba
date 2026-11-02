"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Loader2, ArrowRight, MessageCircle } from "lucide-react";
import { getProducts, Product } from "@/lib/products";
import { Category, getCategories } from "@/lib/categories";
import ProductCard from "./ProductCard";

export default function ProductsCatalog(){
 const params=useSearchParams(); const initial=params.get("categoria") || "all";
 const [products,setProducts]=useState<Product[]>([]), [categories,setCategories]=useState<Category[]>([]), [loading,setLoading]=useState(true), [query,setQuery]=useState(""), [category,setCategory]=useState(initial);
 useEffect(()=>{Promise.all([getProducts(),getCategories()]).then(([p,c])=>{setProducts(p);setCategories(c)}).finally(()=>setLoading(false))},[]);
 const filtered=useMemo(()=>products.filter(p=>{const cats=p.categories?.length?p.categories:[p.category]; const catOk=category==="all"||cats.includes(category); const q=query.trim().toLowerCase(); return catOk && (!q || p.name.toLowerCase().includes(q) || (p.description||"").toLowerCase().includes(q));}),[products,query,category]);
 return <main className="max-w-6xl mx-auto px-4 py-9 md:py-12">
  <div className="mb-7"><p className="text-xs font-semibold text-brand uppercase tracking-[.15em]">Catálogo</p><h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1">Todos los productos</h1><p className="text-sm text-gray-500 mt-2">Buscá por nombre o filtrá por rubro.</p></div>
  <div className="sticky top-16 z-30 bg-[#f8f8fb]/95 backdrop-blur py-3 mb-5">
   <div className="relative mb-3"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar productos..." className="w-full bg-white border border-gray-200 rounded-full pl-11 pr-4 py-3 text-sm outline-none focus:border-brand"/></div>
   <div className="flex gap-2 overflow-x-auto scrollbar-hide"><button onClick={()=>setCategory("all")} className={`px-4 py-2 rounded-full text-xs whitespace-nowrap border ${category==="all"?"bg-gray-950 text-white border-gray-950":"bg-white text-gray-500 border-gray-200"}`}>Todos</button>{categories.map(c=><button key={c.id||c.slug} onClick={()=>setCategory(c.slug)} className={`px-4 py-2 rounded-full text-xs whitespace-nowrap border ${category===c.slug?"bg-brand text-white border-brand":"bg-white text-gray-500 border-gray-200"}`}>{c.icon} {c.label}</button>)}</div>
  </div>
  {loading ? <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-brand"/></div>
  : filtered.length ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">{filtered.map(p=><ProductCard key={p.id} product={p}/>)}</div>
  : category !== "all" && !query.trim() ? <div className="overflow-hidden rounded-3xl bg-gray-950 text-white px-6 py-10 md:px-10 md:py-12">
    <div className="text-4xl mb-5">{categories.find(c=>c.slug===category)?.icon || "🖨️"}</div>
    <p className="text-brand text-xs font-semibold uppercase tracking-[0.16em]">Próximamente</p>
    <h2 className="text-2xl md:text-3xl font-semibold mt-2">Estamos preparando productos para este rubro.</h2>
    <p className="text-sm md:text-base text-gray-400 leading-relaxed mt-4 max-w-2xl">Todavía no publicamos productos en {categories.find(c=>c.slug===category)?.label || "este rubro"}, pero estamos trabajando para sumar nuevas opciones. Mientras tanto, podés explorar el resto del catálogo o contarnos qué necesitás.</p>
    <div className="flex flex-col sm:flex-row gap-3 mt-7">
      <button onClick={()=>setCategory("all")} className="inline-flex items-center justify-center gap-2 bg-brand text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-brand-dark transition-colors">Ver otros productos <ArrowRight size={16}/></button>
      <a href="/pedidos-personalizados" className="inline-flex items-center justify-center gap-2 border border-white/15 bg-white/5 text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"><MessageCircle size={16}/> Pedidos personalizados</a>
    </div>
  </div>
  : <div className="text-center py-24 text-gray-400"><p className="text-4xl mb-3">🔎</p><p className="text-sm">No encontramos productos con esos filtros.</p></div>}
 </main>
}
