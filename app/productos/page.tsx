import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import ProductsCatalog from "@/components/ProductsCatalog";

export const metadata: Metadata = {
  title: "Productos",
  description: "Explorá todos los productos impresos en 3D de EntresD.",
  alternates: { canonical: "/productos" },
};

function CatalogLoading() {
  return (
    <main className="mx-auto min-h-[60vh] max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="h-10 w-56 animate-pulse rounded-xl bg-gray-200" />
      <div className="mt-4 h-5 w-80 max-w-full animate-pulse rounded bg-gray-200" />
    </main>
  );
}

export default function ProductosPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Suspense fallback={<CatalogLoading />}>
        <ProductsCatalog />
      </Suspense>
    </div>
  );
}
