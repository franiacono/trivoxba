import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CategoryClient from "./CategoryClient";
import { getCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === params.slug);
  if (!category) return { title: "Categoría no encontrada" };

  const description = `${category.label} impresos en 3D disponibles en EntresD. Consultá productos, disponibilidad y pedidos.`;
  return {
    title: category.label,
    description,
    alternates: { canonical: `/categoria/${category.slug}` },
    openGraph: {
      title: `${category.label} | EntresD`,
      description,
      url: `/categoria/${category.slug}`,
      siteName: "EntresD",
      images: ["/og-image.png"],
    },
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <CategoryClient slug={params.slug} />
    </div>
  );
}
