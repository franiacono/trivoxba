import {
  collection,
  getDocs,
  serverTimestamp,
  setDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";

export type AnalyticsEventType = "visit" | "product_view";

export interface AnalyticsEvent {
  id?: string;
  type: AnalyticsEventType;
  sessionId: string;
  productId?: string;
  productName?: string;
  path?: string;
  createdAt?: any;
}

function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  const key = "entresd_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

export async function trackVisit(path: string): Promise<void> {
  if (typeof window === "undefined" || path.startsWith("/admin")) return;
  const sessionId = getSessionId();
  if (!sessionId) return;

  // Un documento por sesión: navegar por varias páginas no infla las visitas.
  await setDoc(
    doc(db, "analytics_events", `visit_${sessionId}`),
    {
      type: "visit",
      sessionId,
      path,
      createdAt: serverTimestamp(),
    },
    { merge: false }
  );
}

export async function trackProductView(productId: string, productName: string): Promise<void> {
  if (typeof window === "undefined") return;
  const sessionId = getSessionId();
  if (!sessionId) return;

  // Una visualización por producto y sesión.
  const safeProductId = productId.replace(/[^a-zA-Z0-9_-]/g, "_");
  await setDoc(
    doc(db, "analytics_events", `product_${sessionId}_${safeProductId}`),
    {
      type: "product_view",
      sessionId,
      productId,
      productName,
      path: window.location.pathname,
      createdAt: serverTimestamp(),
    },
    { merge: false }
  );
}

export async function getAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  const snap = await getDocs(collection(db, "analytics_events"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AnalyticsEvent));
}
