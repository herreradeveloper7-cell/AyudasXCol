import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import {
  HeartHandshake,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  LogIn,
  LoaderCircle,
} from "lucide-react";

import { useAuth } from "../context/useAuth";
import { showSuccess, showError } from "../utils/alerts";

export default function Login() {
  const navigate = useNavigate();

  const { login, autenticado } = useAuth();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);

    try {
      const usuario = await login(correo.trim(), contrasena);

      await showSuccess(
        "¡Bienvenido a AyudasXCol!",
        `Has iniciado sesión correctamente, ${usuario.nombre}.`,
      );

      navigate("/", { replace: true });
    } catch (error) {
      await showError("No se pudo iniciar sesión", error.message);
    } finally {
      setCargando(false);
    }
  }

  if (autenticado && !cargando) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
        <section className="relative hidden min-h-[600px] flex-col justify-between overflow-hidden bg-primary p-12 text-white lg:flex">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-secondary/20" />

          <div className="relative flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3 text-emerald-300">
              <HeartHandshake size={32} />
            </div>

            <div>
              <h2 className="text-2xl font-bold">AyudasXCol</h2>
              <p className="text-sm text-slate-300">Gestión humanitaria</p>
            </div>
          </div>

          <div className="relative">
            <HeartHandshake
              size={135}
              strokeWidth={1}
              className="mb-8 text-emerald-300"
            />

            <h2 className="text-4xl font-bold leading-tight">
              Conectamos información para ayudar mejor.
            </h2>

            <p className="mt-5 leading-relaxed text-slate-300">
              Una plataforma que facilita la gestión, consulta y seguimiento de
              ayudas humanitarias en las comunidades del Tolima.
            </p>
          </div>

          <p className="relative text-xs text-slate-400">
            Proyecto de grado · UNAD
          </p>
        </section>

        <section className="flex flex-col justify-center p-7 sm:p-12">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-secondary">
            <ShieldCheck size={30} />
          </div>

          <h2 className="text-3xl font-bold text-primary">Bienvenido</h2>

          <p className="mt-2 text-sm text-slate-500">
            Ingresa tus credenciales para acceder a tu cuenta de AyudasXCol.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Correo electrónico
              </span>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-secondary focus-within:ring-2 focus-within:ring-teal-100">
                <Mail size={19} className="shrink-0 text-slate-400" />

                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  autoComplete="username"
                  className="w-full bg-transparent py-3.5 text-sm outline-none"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Contraseña
              </span>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-secondary focus-within:ring-2 focus-within:ring-teal-100">
                <Lock size={19} className="shrink-0 text-slate-400" />

                <input
                  type={mostrarContrasena ? "text" : "password"}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  className="min-w-0 w-full bg-transparent py-3.5 text-sm outline-none"
                  required
                />

                <button
                  type="button"
                  onClick={() => setMostrarContrasena((prev) => !prev)}
                  aria-label={
                    mostrarContrasena
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  className="text-slate-400 hover:text-primary"
                >
                  {mostrarContrasena ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={cargando}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3.5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? (
                <LoaderCircle size={20} className="animate-spin" />
              ) : (
                <LogIn size={20} />
              )}

              {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-secondary"
            >
              <ArrowLeft size={16} />
              Volver al inicio
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
