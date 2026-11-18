import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  HeartHandshake,
  Menu,
  X,
  House,
  MapPinned,
  ClipboardList,
  Building2,
  HandHeart,
  LogIn,
  LogOut,
  UserRound,
  Users,
} from "lucide-react";

import { useAuth } from "../context/useAuth";
import { showConfirm } from "../utils/alerts";

const enlaces = [
  { ruta: "/", nombre: "Inicio", icono: House },
  { ruta: "/comunidades", nombre: "Comunidades", icono: MapPinned },
  { ruta: "/necesidades", nombre: "Necesidades", icono: ClipboardList },
  { ruta: "/organizaciones", nombre: "Organizaciones", icono: Building2 },
  { ruta: "/ayudas", nombre: "Ayudas", icono: HandHeart },
];

export default function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const navigate = useNavigate();
  const { usuario, autenticado, esAdministrador, logout } = useAuth();

  const enlacesVisibles = esAdministrador
    ? [
        ...enlaces,
        {
          ruta: "/usuarios",
          nombre: "Usuarios",
          icono: Users,
        },
      ]
    : enlaces;

  async function cerrarSesion() {
    const confirmado = await showConfirm({
      title: "¿Cerrar sesión?",
      text: "Tu sesión actual finalizará.",
      confirmText: "Sí, cerrar sesión",
      cancelText: "Cancelar",
    });

    if (!confirmado) return;

    logout();
    setMenuAbierto(false);

    navigate("/login", { replace: true });
  }

  const estiloEnlace = ({ isActive }) =>
    `flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-white/15 text-white"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  function renderSesion() {
    if (!autenticado) {
      return (
        <Link
          to="/login"
          onClick={() => setMenuAbierto(false)}
          className="flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          <LogIn size={18} />
          Iniciar sesión
        </Link>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-white/10 p-2.5 text-emerald-300">
          <UserRound size={21} />
        </div>

        <div className="min-w-0">
          <p className="max-w-36 truncate text-sm font-semibold text-white">
            {usuario.nombre}
          </p>

          <p className="text-xs capitalize text-emerald-300">{usuario.rol}</p>
        </div>

        <button
          type="button"
          onClick={cerrarSesion}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <LogOut size={20} />
        </button>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-[1000] bg-primary shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link
          to="/"
          onClick={() => setMenuAbierto(false)}
          className="flex shrink-0 items-center gap-3"
        >
          <div className="rounded-xl bg-white/10 p-2.5 text-emerald-300">
            <HeartHandshake size={25} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-white">AyudasXCol</h1>

            <p className="text-xs text-slate-300">Gestión humanitaria</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {enlacesVisibles.map(({ ruta, nombre, icono: Icono }) => (
            <NavLink
              key={ruta}
              to={ruta}
              end={ruta === "/"}
              className={estiloEnlace}
            >
              <Icono size={17} />
              {nombre}
            </NavLink>
          ))}
        </nav>

        <div className="hidden xl:block">{renderSesion()}</div>

        <button
          type="button"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
          className="rounded-lg p-2 text-white hover:bg-white/10 xl:hidden"
        >
          {menuAbierto ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {menuAbierto && (
        <nav className="border-t border-white/10 px-5 pb-5 xl:hidden">
          {enlaces.map(({ ruta, nombre, icono: Icono }) => (
            <NavLink
              key={ruta}
              to={ruta}
              end={ruta === "/"}
              className={estiloEnlace}
              onClick={() => setMenuAbierto(false)}
            >
              <Icono size={18} />
              {nombre}
            </NavLink>
          ))}

          <div className="mt-4 border-t border-white/10 pt-4">
            {renderSesion()}
          </div>
        </nav>
      )}
    </header>
  );
}
