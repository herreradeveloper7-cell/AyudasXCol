import { Link } from "react-router-dom";
import {
  MapPin,
  ClipboardList,
  HandHeart,
  ArrowRight,
  Map,
  Search,
} from "lucide-react";

export default function Home({ comunidades, necesidades, ayudas }) {
  const indicadores = [
    {
      nombre: "Comunidades",
      valor: comunidades.length,
      icono: MapPin,
    },
    {
      nombre: "Necesidades",
      valor: necesidades.length,
      icono: ClipboardList,
    },
    {
      nombre: "Ayudas",
      valor: ayudas.length,
      icono: HandHeart,
    },
  ];

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-primary px-7 py-12 text-white md:px-12">
        <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold tracking-wider text-emerald-200">
          PROYECTO AYUDASXCOL
        </span>

        <h2 className="mt-6 max-w-2xl text-3xl font-bold leading-tight md:text-5xl">
          Conectamos información para ayudar mejor.
        </h2>

        <p className="mt-5 max-w-2xl text-slate-200">
          Plataforma para registrar, consultar y dar seguimiento a necesidades y
          ayudas humanitarias en comunidades del departamento del Tolima.
        </p>

        <Link
          to="/comunidades"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Explorar comunidades
          <ArrowRight size={18} />
        </Link>
      </section>

      <section>
        <h3 className="mb-5 text-2xl font-bold text-primary">
          Resumen general
        </h3>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {indicadores.map(({ nombre, valor, icono: Icono }) => (
            <div
              key={nombre}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 inline-flex rounded-xl bg-teal-50 p-3 text-secondary">
                <Icono size={24} />
              </div>

              <p className="text-3xl font-bold text-primary">{valor}</p>

              <p className="mt-1 text-sm text-slate-500">
                {nombre} registradas
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-5 text-2xl font-bold text-primary">
          Explora la plataforma
        </h3>

        <div className="grid gap-5 md:grid-cols-2">
          <Link
            to="/comunidades"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-secondary"
          >
            <Map size={28} className="text-secondary" />

            <h4 className="mt-4 text-lg font-bold text-primary">
              Mapa de comunidades
            </h4>

            <p className="mt-2 text-sm text-slate-500">
              Visualiza la ubicación de las comunidades registradas en el
              Tolima.
            </p>

            <span className="mt-5 flex items-center gap-2 text-sm font-semibold text-secondary">
              Explorar mapa <ArrowRight size={17} />
            </span>
          </Link>

          <Link
            to="/ayudas"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-secondary"
          >
            <Search size={28} className="text-secondary" />

            <h4 className="mt-4 text-lg font-bold text-primary">
              Consultar ayudas
            </h4>

            <p className="mt-2 text-sm text-slate-500">
              Filtra ayudas por municipio, fecha, tipo, organización y estado.
            </p>

            <span className="mt-5 flex items-center gap-2 text-sm font-semibold text-secondary">
              Ver ayudas <ArrowRight size={17} />
            </span>
          </Link>
        </div>
      </section>

      <p className="text-center text-xs text-slate-500">
        Prototipo académico — Información simulada para pruebas.
      </p>
    </div>
  );
}
