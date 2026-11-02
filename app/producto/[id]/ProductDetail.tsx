"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MessageCircle, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, ZoomIn, ShoppingCart, Check, Share2, Copy } from "lucide-react";
import { Product, productPath } from "@/lib/products";
import { Category, getCategories } from "@/lib/categories";
import { trackProductView } from "@/lib/analytics";
import { waProductLink } from "@/lib/whatsapp";
import { useCart } from "@/lib/cart";
import Link from "next/link";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import ProductConfigurator from "@/components/ProductConfigurator";

// Convierte texto con bullets y saltos de línea a HTML legible
function formatDescription(text: string): string {
  if (!text) return "";
  const lines = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/#{1,6}\s+/g, "")
    .split("\n");

  let html = "";
  let inList = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (inList) { html += "</ul>"; inList = false; }
      html += "<br/>";
      continue;
    }
    if (line.startsWith("* ") || line.startsWith("- ")) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${line.slice(2)}</li>`;
    } else {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<p>${line}</p>`;
    }
  }
  if (inList) html += "</ul>";
  return html;
}

export default function ProductDetail({ product }: { product: Product }) {
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setAvailableCategories).catch(() => setAvailableCategories([]));
  }, []);

  useEffect(() => {
    if (product.id) {
      trackProductView(product.id, product.name).catch(() => {
        // No bloqueamos la ficha si falla una métrica.
      });
    }
  }, [product.id, product.name]);
  const { add } = useCart();

  async function handleShare() {
    const url = `https://entresd.com.ar${productPath(product)}`;
    if (navigator.share) {
      await navigator.share({ title: product.name, text: `Mirá este producto: ${product.name}`, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleAdd() {
    add({ id: product.id!, name: product.name, price: product.price, image: product.images?.[0] });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const productCategorySlugs =
    product.categories?.length ? product.categories : product.category ? [product.category] : [];
  const productCategories = availableCategories.filter((c) => productCategorySlugs.includes(c.slug));
  const cat = productCategories[0];

  const badge = {
    in_stock: { label: "En stock", color: "text-emerald-700 bg-emerald-50", icon: <CheckCircle size={13} /> },
    days: { label: "A pedido", color: "text-amber-700 bg-amber-50", icon: <Clock size={13} /> },
    unavailable: { label: "Sin stock temporalmente", color: "text-red-500 bg-red-50", icon: <XCircle size={13} /> },
  }[product.stockStatus];

  const slides = (product.images || []).map((src) => ({ src }));
  const formattedDesc = formatDescription(product.description || "");

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 md:py-10 overflow-x-hidden">

      {/* Breadcrumb — solo en desktop */}
      <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 mb-8 flex-wrap">
        <Link href="/" className="hover:text-brand">Inicio</Link>
        <span>/</span>
        {productCategories.map((category, index) => (
          <span key={category.slug} className="flex items-center gap-2">
            {index > 0 && <span>·</span>}
            <Link href={`/categoria/${category.slug}`} className="hover:text-brand">{category.label}</Link>
          </span>
        ))}
        {productCategories.length > 0 && <span>/</span>}
        <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Mobile: back button */}
      <div className="flex md:hidden items-center gap-2 mb-3">
        {cat && (
          <Link href={`/categoria/${cat.slug}`} className="flex items-center gap-1 text-xs text-brand">
            <ChevronLeft size={14} /> {cat.label}
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(0,.92fr)] gap-7 lg:gap-10 items-start">
        {/* Gallery */}
        <div className="min-w-0">
          <div
            className="relative w-full overflow-hidden bg-[#f4f3f1] cursor-zoom-in group rounded-3xl border border-gray-100"
            style={{ aspectRatio: "1/1" }}
            onClick={() => setLightboxOpen(true)}
          >
            {product.images?.length > 0 ? (
              <Image
                src={product.images[activeImg]}
                alt={product.name}
                fill
                className="object-contain p-3 md:p-6"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">🖨️</div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={28} />
            </div>
            {product.images?.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveImg((i) => Math.max(0, i - 1)); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 hover:bg-white transition-colors shadow-sm"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveImg((i) => Math.min(product.images.length - 1, i + 1)); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 hover:bg-white transition-colors shadow-sm"
                >
                  <ChevronRight size={16} />
                </button>
                {/* Dots indicator mobile */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {product.images.slice(0, 8).map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeImg ? "bg-brand" : "bg-white/60"}`} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails — solo desktop */}
          {product.images?.length > 1 && (
            <div className="hidden md:flex gap-2.5 mt-3 overflow-x-auto scrollbar-hide">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 bg-gray-50 transition-colors ${i === activeImg ? "border-brand" : "border-transparent hover:border-gray-200"}`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex flex-col gap-5 lg:sticky lg:top-24">
          {cat && (
            <Link href={`/categoria/${cat.slug}`} className="text-xs text-brand font-semibold uppercase tracking-[0.12em] hidden md:block">
              {cat.icon} {cat.label}
            </Link>
          )}
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-950 leading-[1.08] break-words [overflow-wrap:anywhere]">{product.name}</h1>

          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full w-fit ${badge.color}`}>
            {badge.icon} {badge.label}
          </span>

          <div
            className="text-gray-500 text-sm md:text-[15px] leading-relaxed product-desc border-t border-gray-100 pt-5"
            dangerouslySetInnerHTML={{ __html: formattedDesc }}
          />

          <div className="flex items-center justify-between border-y border-gray-100 py-4">
            {product.priceOnRequest ? (
              <div className="text-base font-medium text-gray-400 italic">Precio a consultar</div>
            ) : (
              <div className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-950">
                ${product.price.toLocaleString("es-AR")}
              </div>
            )}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand transition-colors px-3 py-2 rounded-full hover:bg-brand/5"
            >
              {copied ? <Copy size={15} className="text-brand" /> : <Share2 size={15} />}
              <span className="hidden sm:block">{copied ? "¡Copiado!" : "Compartir"}</span>
            </button>
          </div>

          {product.configurable ? (
            <ProductConfigurator product={product} />
          ) : product.priceOnRequest ? (
            <>
              <a href={waProductLink(product.name, 0, product.id)} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-wa text-white font-medium px-6 py-4 rounded-2xl text-sm hover:opacity-90 transition-opacity">
                <MessageCircle size={18} /> Consultar precio por WhatsApp
              </a>
              <p className="text-xs text-gray-400 text-center">
                Te respondo con precio y disponibilidad a la brevedad.
              </p>
            </>
          ) : (
            <>
              <button
                onClick={handleAdd}
                disabled={product.stockStatus === "unavailable"}
                className={`flex items-center justify-center gap-2 font-medium px-6 py-4 rounded-2xl text-sm transition-all ${
                  added ? "bg-emerald-500 text-white"
                  : product.stockStatus === "unavailable" ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-brand text-white hover:bg-brand-dark"
                }`}
              >
                {added ? <Check size={18} /> : <ShoppingCart size={18} />}
                {product.stockStatus === "unavailable" ? "Sin stock por ahora" : added ? "¡Agregado al carrito!" : "Agregar al carrito"}
              </button>
              <a href={waProductLink(product.name, product.price, product.id)} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 font-medium px-6 py-3.5 rounded-2xl text-sm hover:border-wa hover:text-wa transition-colors">
                <MessageCircle size={16} /> Consultar por WhatsApp
              </a>
              <p className="text-xs text-gray-400 text-center">
                Te respondo a la brevedad con disponibilidad y tiempo de entrega.
              </p>
            </>
          )}
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={activeImg}
      />
    </div>
  );
}
