import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Category {
  id?: string;
  slug: string;
  label: string;
  icon: string;
  order?: number;
  active?: boolean;
  image?: string;
}

const COL = "categories";

export function slugifyCategoryName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Se usa únicamente para la migración inicial y como respaldo si todavía
// no existe la colección categories en Firestore.
export const DEFAULT_CATEGORIES: Category[] = [
  { slug: "herramientas", label: "Herramientas", icon: "🔧", order: 1, active: true },
  { slug: "organizadores", label: "Organizadores", icon: "📦", order: 2, active: true },
  { slug: "mate", label: "Mate", icon: "🧉", order: 3, active: true },
  { slug: "decoraciones", label: "Decoraciones", icon: "✨", order: 4, active: true },
  { slug: "automotor", label: "Automotor", icon: "🚗", order: 5, active: true },
  { slug: "otros", label: "Otros", icon: "🖨️", order: 6, active: true },
];

export async function getCategories(includeInactive = false): Promise<Category[]> {
  const snap = await getDocs(collection(db, COL));
  const categories = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
  return categories
    .filter((c) => includeInactive || c.active !== false)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.label.localeCompare(b.label));
}

export async function createCategory(data: Omit<Category, "id">): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export async function ensureDefaultCategories(): Promise<Category[]> {
  const existing = await getCategories(true);
  if (existing.length > 0) return existing;

  for (const category of DEFAULT_CATEGORIES) {
    await createCategory(category);
  }
  return getCategories(true);
}
