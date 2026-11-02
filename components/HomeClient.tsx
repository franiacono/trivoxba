"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { getProducts, Product } from "@/lib/products";
import { Category, getCategories } from "@/lib/categories";
import ProductCard from "./ProductCard";
import { ArrowLeft, ArrowRight, Loader2, MessageCircle, PackageCheck, Printer } from "lucide-react";

function HorizontalRail({ children, label }: { children: ReactNode; label: string }) {
  const rail = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = () => {
    const el = rail.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    update();
    const el = rail.current;
    if (!el) return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children]);

  const scroll = (direction: number) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(280, el.clientWidth * 0.78), behavior: "smooth" });
    window.setTimeout(update, 350);
  };

  return (
    <div className="relative group/rail">
      <div ref={rail} onScroll={update} className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-hide">
        {children}
      </div>
      {canLeft && <button type="button" aria-label={`Anterior en ${label}`} onClick={() => scroll(-1)} className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 items-center justify-center text-gray-700 hover:text-brand"><ArrowLeft size={18}/></button>}
      {canRight && <button type="button" aria-label={`Siguiente en ${label}`} onClick={() => scroll(1)} className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 items-center justify-center text-gray-700 hover:text-brand"><ArrowRight size={18}/></button>}
    </div>
  );
}

export default function HomeClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .finally(() => setLoading(false));
  }, []);

  const heroProduct = useMemo(() => products.find(p => p.hero && p.images?.[0]) || products.find(p => p.images?.[0]), [products]);
  const featured = useMemo(() => products.filter(p => p.featured), [products]);
  const novelties = useMemo(() => products.filter(p => p.novelty), [products]);
  const categoryImage = (c: Category) => c.image || products.find(p => (p.categories?.length ? p.categories : [p.category]).includes(c.slug) && p.images?.[0])?.images?.[0];

  return <>
    <section className="relative bg-gray-950 text-white overflow-hidden">
      <div className="max-w-6xl mx-auto min-h-[470px] md:min-h-[560px] grid md:grid-cols-[.82fr_1.18fr]">
        <div className="relative z-10 px-5 md:px-4 py-16 md:py-24 flex flex-col justify-center">
          <span className="text-brand text-xs font-semibold uppercase tracking-[.18em] mb-4">Impresión 3D · EntresD</span>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-[-.045em] leading-[1.02]">Objetos útiles,<br/>impresos en 3D.</h1>
          <p className="text-white/65 mt-5 max-w-md text-sm md:text-base leading-relaxed">Soluciones prácticas para todos los días. Organización, herramientas, mate y mucho más.</p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link href="/productos" className="inline-flex items-center gap-2 bg-brand text-white px-5 py-3 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors">Explorar productos <ArrowRight size={15}/></Link>
            <Link href="/pedidos-personalizados" className="inline-flex items-center gap-2 border border-white/30 px-5 py-3 rounded-full text-sm font-medium hover:bg-white/10 transition-colors">Pedidos personalizados</Link>
          </div>
        </div>
        <div className="relative min-h-[320px] md:min-h-full">
          {loading ? <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin text-brand"/></div> : heroProduct?.images?.[0] ? <>
            <Image src={heroProduct.images[0]} alt={heroProduct.name} fill priority className="object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/30 to-transparent md:block hidden"/>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent md:hidden"/>
          </> : <div className="absolute inset-0 bg-gray-900 flex items-center justify-center"><Printer size={56} className="text-brand"/></div>}
        </div>
      </div>
    </section>

    <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      <div className="flex items-end justify-between mb-5"><div><p className="text-xs text-brand font-semibold uppercase tracking-[.15em]">Descubrí</p><h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">Explorá por rubro</h2></div><Link href="/productos" className="text-xs font-medium text-gray-500 hover:text-brand">Ver todos <ArrowRight size={13} className="inline"/></Link></div>
      <HorizontalRail label="rubros">
        {categories.map(c => <Link key={c.id || c.slug} href={`/productos?categoria=${c.slug}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all snap-start flex-none w-[78vw] sm:w-[45%] lg:w-[calc((100%-3rem)/4)]">
          <div className="relative aspect-[4/3] bg-gray-100">{categoryImage(c) ? <Image src={categoryImage(c)!} alt={c.label} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-500"/> : <div className="w-full h-full flex items-center justify-center text-5xl">{c.icon}</div>}</div>
          <div className="p-4 flex items-center justify-between"><div><p className="font-semibold text-sm text-gray-950">{c.label}</p><p className="text-[11px] text-gray-400 mt-0.5">Ver productos</p></div><span className="w-8 h-8 rounded-full border border-brand/30 text-brand flex items-center justify-center"><ArrowRight size={14}/></span></div>
        </Link>)}
      </HorizontalRail>
    </section>

    <section className="max-w-6xl mx-auto px-4 pb-12 grid lg:grid-cols-[1.65fr_.75fr] gap-8">
      <div className="min-w-0">
        <div className="flex items-center justify-between mb-4"><h2 className="text-xl md:text-2xl font-semibold">Productos destacados</h2><Link href="/productos" className="text-xs text-gray-500 hover:text-brand">Ver todos <ArrowRight size={13} className="inline"/></Link></div>
        {loading ? <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-brand"/></div> : featured.length ? <HorizontalRail label="productos destacados">{featured.map(p => <div key={p.id} className="flex-none snap-start w-[62vw] sm:w-[38%] md:w-[calc((100%-2.25rem)/4)]"><ProductCard product={p}/></div>)}</HorizontalRail> : <p className="text-sm text-gray-400 py-6">Todavía no seleccionaste productos destacados desde el Admin.</p>}

        <div className="flex items-center justify-between mb-4 mt-10"><h2 className="text-xl md:text-2xl font-semibold">Novedades</h2><Link href="/productos" className="text-xs text-gray-500 hover:text-brand">Ver todos <ArrowRight size={13} className="inline"/></Link></div>
        {novelties.length ? <HorizontalRail label="novedades">{novelties.map(p => <div key={p.id} className="flex-none snap-start w-[62vw] sm:w-[38%] md:w-[calc((100%-2.25rem)/4)]"><ProductCard product={p}/></div>)}</HorizontalRail> : <p className="text-sm text-gray-400 py-6">No hay productos marcados como novedad.</p>}
      </div>
      <aside className="lg:pt-10">
        <div className="bg-gray-950 text-white rounded-[1.75rem] p-7 min-h-[310px] flex flex-col justify-end relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-brand/25 blur-3xl"/>
          <MessageCircle size={30} className="text-brand mb-5 relative"/>
          <h3 className="text-2xl font-semibold relative">¿No encontrás exactamente lo que necesitás?</h3>
          <p className="text-white/60 text-sm leading-relaxed mt-3 relative">Podemos buscar una solución mediante impresión 3D. Contanos tu idea y vemos juntos una alternativa.</p>
          <Link href="/pedidos-personalizados" className="mt-6 relative inline-flex w-fit items-center gap-2 bg-brand text-white px-5 py-3 rounded-full text-sm font-semibold">Pedidos personalizados <ArrowRight size={14}/></Link>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5 text-center">
          <div><Printer size={19} className="mx-auto text-brand mb-2"/><p className="text-[10px] text-gray-500">Impresión cuidada</p></div>
          <div><PackageCheck size={19} className="mx-auto text-brand mb-2"/><p className="text-[10px] text-gray-500">Hecho a pedido</p></div>
          <div><MessageCircle size={19} className="mx-auto text-brand mb-2"/><p className="text-[10px] text-gray-500">Atención directa</p></div>
        </div>
      </aside>
    </section>

    <footer className="bg-gray-950 text-white/50"><div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-between"><span className="font-semibold text-white">Entres<span className="text-brand">D</span></span><span className="text-xs">© 2026 EntresD · Impresión 3D</span></div></footer>
  </>;
}
