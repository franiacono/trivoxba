import type { Metadata } from "next";
import { getProductByIdentifier, productPath, slugifyProductName } from "@/lib/products";
import Navbar from "@/components/Navbar";
import { notFound, redirect } from "next/navigation";
import ProductDetail from "./ProductDetail";

export const revalidate = 60;

function plainText(value: string) {
  return (value || "")
    .replace(/\\*\\*(.*?)\\*\\*/g, "$1")
    .replace(/#{1,6}\\s+/g, "")
    .replace(/^[*-]\\s+/gm, "")
    .replace(/\\s+/g, " ")
    .trim();
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProductByIdentifier(params.id);

  if (!product || !product.active) {
    return { title: "Producto no encontrado | EntresD" };
  }

  const description = plainText(product.description).slice(0, 155) || `Conocé ${product.name} en EntresD.`;
  const canonical = productPath(product);
  const image = product.images?.[0] || "/og-image.png";

  return {
    title: product.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "es_AR",
      url: canonical,
      siteName: "EntresD",
      title: product.name,
      description,
      images: [{ url: image, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductByIdentifier(params.id);
  if (!product || !product.active) notFound();

  const slug = slugifyProductName(product.name);
  if (params.id !== slug) redirect(productPath(product));

  const productUrl = `https://entresd.com.ar${productPath(product)}`;
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: plainText(product.description),
    image: product.images || [],
    url: productUrl,
    brand: { "@type": "Brand", name: "EntresD" },
  };

  if (!product.priceOnRequest) {
    jsonLd.offers = {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: product.price,
      url: productUrl,
      availability:
        product.stockStatus === "unavailable"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    };
  }

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Navbar />
      <ProductDetail product={product} />
    </div>
  );
}
