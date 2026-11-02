import type { MetadataRoute } from "next";
import { getProducts, productPath } from "@/lib/products";
import { getCategories } from "@/lib/categories";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://entresd.com.ar";
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/productos`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/pedidos-personalizados`, changeFrequency: "monthly", priority: 0.7 },
    ...categories.map((category) => ({
      url: `${base}/categoria/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${base}${productPath(product)}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
