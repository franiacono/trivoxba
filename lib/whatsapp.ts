import { slugifyProductName } from "./products";

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || "5491150241776";

export function waProductLink(productName: string, price: number, productId?: string): string {
  const slug = slugifyProductName(productName);
  const link = productId ? `https://entresd.com.ar/producto/${slug || productId}` : "";
  const msg = `Hola! Me interesa *${productName}* ${link}`;
  return `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
}

export interface WaCartItem {
  name: string;
  price: number;
  qty: number;
}

export function waCartLink(items: WaCartItem[]): string {
  const lines = items.map((i) => `• ${i.qty}x ${i.name} — $${(i.price * i.qty).toLocaleString("es-AR")}`).join("\n");
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const msg = `Hola! Quiero hacer un pedido:\n\n${lines}\n\n*Total aprox: $${total.toLocaleString("es-AR")}*\n\n¿Me confirmás disponibilidad y forma de envío?`;
  return `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
}
