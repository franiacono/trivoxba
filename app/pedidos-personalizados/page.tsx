import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Camera, MessageCircle, Printer, Ruler, Search, Settings2 } from "lucide-react";
import Navbar from "@/components/Navbar";

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || "5491150241776";
const message = encodeURIComponent("Hola! Quisiera consultar por un pedido personalizado. Tengo una idea/necesidad y quería ver si podemos encontrar una solución.");

export const metadata: Metadata = {
  title: "Pedidos personalizados",
  description: "¿Necesitás una pieza o solución particular? Contanos qué necesitás y buscamos una alternativa que podamos resolver con impresión 3D.",
  alternates: { canonical: "/pedidos-personalizados" },
};

export default function PedidosPersonalizadosPage() {
  return <div className="min-h-screen bg-[#faf9f7]">
    <Navbar />
    <main>
      <section className="bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors mb-10"><ArrowLeft size={14}/> Volver</Link>
          <div className="grid md:grid-cols-[1.35fr_.65fr] gap-10 items-end">
            <div>
              <span className="text-brand text-xs font-semibold uppercase tracking-[0.18em]">Pedidos personalizados</span>
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mt-4 leading-[1.05] max-w-3xl">Contanos el problema. Buscamos una solución.</h1>
              <p className="text-gray-400 text-base md:text-lg leading-relaxed mt-6 max-w-2xl">No todo tiene que estar publicado en el catálogo. Si necesitás organizar algo, reemplazar una pieza, adaptar un soporte o tenés una idea concreta, vemos qué alternativa podemos resolver mediante impresión 3D.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-medium">No necesitás tener un diseño 3D.</p>
              <p className="text-xs text-gray-400 leading-relaxed mt-2">Una foto, algunas medidas y una explicación de lo que necesitás suelen ser suficientes para empezar a evaluar la idea.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-8"><span className="text-brand text-xs font-semibold uppercase tracking-[0.16em]">Cómo funciona</span><h2 className="text-2xl md:text-3xl font-semibold text-gray-950 mt-2">De la necesidad a una pieza impresa.</h2></div>
        <div className="grid md:grid-cols-3 gap-4">
          <InfoCard number="01" icon={<Search size={20}/>} title="Contanos la necesidad" text="Mandanos una foto, medidas o una explicación simple para entender qué querés resolver."/>
          <InfoCard number="02" icon={<Settings2 size={20}/>} title="Buscamos una alternativa" text="Evaluamos si existe una solución adecuada o si podemos adaptar una propuesta a tu caso."/>
          <InfoCard number="03" icon={<Printer size={20}/>} title="Coordinamos la impresión" text="Si es viable, definimos material, color, medidas, precio y tiempos antes de imprimir."/>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mt-6">
          <MiniCard icon={<Camera size={17}/>} text="Fotos del lugar o pieza"/>
          <MiniCard icon={<Ruler size={17}/>} text="Medidas aproximadas"/>
          <MiniCard icon={<MessageCircle size={17}/>} text="Qué necesitás resolver"/>
        </div>

        <section className="mt-12 rounded-3xl bg-brand px-6 py-8 md:px-10 md:py-10 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-7">
          <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">¿Tenés algo en mente?</p><h2 className="text-2xl md:text-3xl font-semibold mt-2">Mandanos la idea y vemos si podemos hacerla realidad.</h2><p className="text-sm text-white/80 mt-3 leading-relaxed">No hace falta que tengas todo resuelto de antemano. Cuanta más información nos pases, mejor podemos orientarte.</p></div>
          <a href={`https://wa.me/${WA}?text=${message}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-white text-gray-950 px-5 py-3.5 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap">Consultar por WhatsApp <ArrowRight size={16}/></a>
        </section>
      </section>
    </main>
  </div>;
}

function InfoCard({ number, icon, title, text }: { number: string; icon: React.ReactNode; title: string; text: string }) {
  return <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm"><div className="flex items-center justify-between"><div className="w-10 h-10 rounded-2xl bg-orange-50 text-brand flex items-center justify-center">{icon}</div><span className="text-xs font-semibold text-gray-300">{number}</span></div><h3 className="text-base font-semibold text-gray-950 mt-6">{title}</h3><p className="text-sm text-gray-500 leading-relaxed mt-2">{text}</p></div>;
}
function MiniCard({ icon, text }: { icon: React.ReactNode; text: string }) { return <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3.5 text-sm text-gray-600"><span className="text-brand">{icon}</span>{text}</div>; }
