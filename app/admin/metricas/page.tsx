"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Loader2, PackageOpen, Users } from "lucide-react";
import { AnalyticsEvent, getAnalyticsEvents } from "@/lib/analytics";

function eventDate(event: AnalyticsEvent): Date | null {
  if (!event.createdAt) return null;
  if (typeof event.createdAt.toDate === "function") return event.createdAt.toDate();
  if (event.createdAt.seconds) return new Date(event.createdAt.seconds * 1000);
  return null;
}

export default function MetricasPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsEvents()
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const visits = events.filter((e) => e.type === "visit");
    const views = events.filter((e) => e.type === "product_view");

    const since = (items: AnalyticsEvent[], days: number) =>
      items.filter((e) => {
        const date = eventDate(e);
        return date && date.getTime() >= now - days * day;
      }).length;

    const products = new Map<string, { name: string; views: number }>();
    for (const event of views) {
      const key = event.productId || event.productName || "sin-id";
      const current = products.get(key) || { name: event.productName || "Producto", views: 0 };
      current.views += 1;
      products.set(key, current);
    }

    return {
      visits7: since(visits, 7),
      visits30: since(visits, 30),
      views30: since(views, 30),
      totalVisits: visits.length,
      topProducts: Array.from(products.values()).sort((a, b) => b.views - a.views).slice(0, 10),
    };
  }, [events]);

  if (loading) {
    return <div className="flex justify-center py-20 text-brand"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Métricas</h1>
        <p className="text-sm text-gray-400 mt-1">
          Una vista simple del tráfico y de los productos que más se consultan.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <MetricCard icon={<Users size={18} />} label="Visitas · 7 días" value={stats.visits7} />
        <MetricCard icon={<Users size={18} />} label="Visitas · 30 días" value={stats.visits30} />
        <MetricCard icon={<Eye size={18} />} label="Productos vistos · 30 días" value={stats.views30} />
        <MetricCard icon={<PackageOpen size={18} />} label="Visitas desde que medimos" value={stats.totalVisits} />
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Productos más vistos</h2>
          <p className="text-xs text-gray-400 mt-0.5">Una vista por producto y sesión.</p>
        </div>

        {stats.topProducts.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-400">
            Todavía no hay visualizaciones registradas.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {stats.topProducts.map((product, index) => (
              <div key={`${product.name}-${index}`} className="px-5 py-3.5 flex items-center gap-4">
                <span className="text-xs text-gray-300 w-5">{index + 1}</span>
                <span className="text-sm text-gray-700 flex-1">{product.name}</span>
                <span className="text-sm font-semibold text-gray-900">{product.views}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
        Las visitas representan sesiones del navegador, por lo que sirven como una referencia práctica de tráfico y no como identificación exacta de personas.
      </p>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <div className="text-brand mb-3">{icon}</div>
      <div className="text-2xl font-semibold text-gray-950">{value.toLocaleString("es-AR")}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}
