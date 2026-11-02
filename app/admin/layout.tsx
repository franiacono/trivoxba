"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LayoutGrid, Plus, LogOut, Store, Loader2, Tags, BarChart3 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setAuthorized(null);
        setChecking(false);
        return;
      }

      try {
        const token = await currentUser.getIdToken();
        const res = await fetch("/api/admin-session", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        setAuthorized(res.ok);
      } catch {
        setAuthorized(false);
      }
      setChecking(false);
    });
  }, []);

  async function loginGoogle() {
    setLoggingIn(true);
    setError("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e: any) {
      setError(e?.code === "auth/popup-closed-by-user" ? "Se cerró la ventana de Google." : "No se pudo iniciar sesión con Google.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function loginEmail() {
    if (!email.trim() || !password) {
      setError("Ingresá email y contraseña.");
      return;
    }
    setLoggingIn(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setError("Email o contraseña incorrectos.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function logout() {
    await signOut(auth);
  }

  if (checking) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-brand"><Loader2 className="animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-sm shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center mb-4">
            <span className="text-white font-bold text-sm">3D</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-1">Panel admin</h1>
          <p className="text-sm text-gray-400 mb-6">EntresD — acceso restringido</p>

          <button onClick={loginGoogle} disabled={loggingIn}
            className="w-full border border-gray-200 bg-white text-gray-700 font-medium py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
            Continuar con Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-gray-100 flex-1" />
            <span className="text-[11px] text-gray-400">o con email</span>
            <div className="h-px bg-gray-100 flex-1" />
          </div>

          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-3 outline-none focus:border-brand" />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loginEmail()}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-3 outline-none focus:border-brand" />
          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
          <button onClick={loginEmail} disabled={loggingIn}
            className="w-full bg-brand text-white font-medium py-2.5 rounded-xl text-sm hover:bg-brand-dark transition-colors disabled:opacity-50">
            {loggingIn ? "Ingresando..." : "Entrar"}
          </button>
        </div>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-lg shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Cuenta todavía no autorizada</h1>
          <p className="text-sm text-gray-500 mb-5">El inicio de sesión funcionó. Copiá este UID para agregar esta cuenta como administradora:</p>
          <code className="block break-all select-all bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-700 mb-5">{user.uid}</code>
          <div className="flex gap-3">
            <button onClick={logout} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cerrar sesión</button>
            <Link href="/" className="px-4 py-2 rounded-xl bg-brand text-white text-sm font-medium">Volver a la tienda</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center flex-shrink-0"><span className="text-white font-bold text-xs">3D</span></div>
            <span className="font-semibold text-sm text-gray-900 hidden sm:block">Admin</span>
          </div>
          <div className="h-4 w-px bg-gray-200 hidden sm:block" />
          <Link href="/admin" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand transition-colors"><LayoutGrid size={15} /> <span className="hidden sm:block">Productos</span></Link>
          <Link href="/admin/nuevo" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand transition-colors"><Plus size={15} /> Nuevo</Link>
          <Link href="/admin/rubros" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand transition-colors"><Tags size={15} /> <span className="hidden sm:block">Rubros</span></Link>
          <Link href="/admin/metricas" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand transition-colors"><BarChart3 size={15} /> <span className="hidden sm:block">Métricas</span></Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-[11px] text-gray-400 max-w-48 truncate" title={`UID: ${user.uid}`}>{user.email}</span>
          <Link href="/" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"><Store size={14} /> Tienda</Link>
          <button onClick={logout} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"><LogOut size={13} /> <span className="hidden sm:block">Salir</span></button>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <strong>UID de esta cuenta:</strong> <code className="break-all select-all">{user.uid}</code>
        </div>
        {children}
      </main>
    </div>
  );
}
