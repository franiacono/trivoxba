"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getProduct, Product } from "@/lib/products";
import ProductForm from "@/components/ProductForm";

export default function EditarPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        // Leer directamente de Firestore al abrir el editor.
        // Así no dependemos del Router Cache de Next.js.
        const current = await getProduct(id);

        if (!active) return;

        if (!current) {
          setError("No se encontró el producto.");
          setProduct(null);
        } else {
          setProduct(current);
        }
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "No se pudo cargar el producto.");
        setProduct(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    if (id) loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div>
      <Link
        href="/admin"
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Volver
      </Link>

      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        Editar producto
      </h1>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-8">
          <Loader2 size={18} className="animate-spin" />
          Cargando producto...
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : product ? (
        <ProductForm key={product.id} mode="edit" initial={product} />
      ) : null}
    </div>
  );
}
