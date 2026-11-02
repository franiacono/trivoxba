import ProductForm from "@/components/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NuevoPage() {
  return (
    <div>
      <Link href="/admin" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft size={14} /> Volver
      </Link>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Nuevo producto</h1>
      <ProductForm mode="create" />
    </div>
  );
}
