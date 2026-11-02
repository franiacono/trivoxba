import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import SiteAnalytics from "@/components/SiteAnalytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://entresd.com.ar"),
  title: {
    default: "EntresD — Impresión 3D y productos funcionales",
    template: "%s | EntresD",
  },
  description:
    "Productos funcionales e impresión 3D a pedido. Organizadores, herramientas, accesorios para mate, automotor y más.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    title: "EntresD — Impresión 3D y productos funcionales",
    description:
      "Productos funcionales e impresión 3D a pedido. Organizadores, herramientas, accesorios para mate, automotor y más.",
    siteName: "EntresD",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "EntresD" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EntresD — Impresión 3D y productos funcionales",
    description: "Productos funcionales e impresión 3D a pedido.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body>
        <CartProvider><SiteAnalytics />{children}</CartProvider>
      </body>
    </html>
  );
}
