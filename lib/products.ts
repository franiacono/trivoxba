import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type StockStatus = "in_stock" | "days" | "unavailable";

export interface ConfigExtra {
  id: string;
  name: string;
  price: number;
  priceOnRequest?: boolean;
  printMinutes: number;
  stockStatus: StockStatus;
  maxQty: number;
  images?: string[];
}

export interface ConfigIncluded {
  id: string;
  name: string;
  qty: number;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string; // legado: se conserva para productos existentes
  categories?: string[];
  images: string[];
  stockStatus: StockStatus;
  deliveryDays?: number;
  active: boolean;
  order?: number;
  priceOnRequest?: boolean;
  featured?: boolean;
  novelty?: boolean;
  hero?: boolean;
  configurable?: boolean;
  basePrintMinutes?: number;
  included?: ConfigIncluded[];
  extras?: ConfigExtra[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

const COL = "products";

export async function getProducts(category?: string): Promise<Product[]> {
  const ref = collection(db, COL);
  const snap = await getDocs(query(ref, where("active", "==", true)));
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  const filtered = category
    ? all.filter((p) => (p.categories?.length ? p.categories.includes(category) : p.category === category))
    : all;
  return filtered.sort((a: any, b: any) => {
    const aOrder = a.order ?? 999;
    const bOrder = b.order ?? 999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);
  });
}

export async function getAllProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Product))
    .sort((a: any, b: any) => {
      const aOrder = a.order ?? 999;
      const bOrder = b.order ?? 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);
    });
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}


export function slugifyProductName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function productPath(product: Pick<Product, "id" | "name">): string {
  const slug = slugifyProductName(product.name);
  return `/producto/${slug || product.id}`;
}

export async function getProductByIdentifier(identifier: string): Promise<Product | null> {
  // Mantiene compatibilidad con las URLs antiguas que usaban el ID de Firestore.
  const byId = await getProduct(identifier);
  if (byId) return byId;

  const products = await getProducts();
  return products.find((product) => slugifyProductName(product.name) === identifier) || null;
}

export async function createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

