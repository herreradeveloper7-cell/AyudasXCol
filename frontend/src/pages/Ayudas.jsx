import FormularioAyuda from "../components/FormularioAyuda";
import ListadoAyudas from "../components/ListadoAyudas";

import { Package, CalendarClock, PackageCheck } from "lucide-react";

export default function Ayudas({
  comunidades,
  necesidades,
  ayudas,
  cargarDatos,
  versionOrganizaciones,
}) {
  const indicadores = [
    {
      nombre: "Total de ayudas",
      cantidad: ayudas.length,
      icono: Package,
      color: "bg-teal-50 text-secondary",
    },
    {
      nombre: "Ayudas programadas",
      cantidad: ayudas.filter((a) => a.estado === "programada").length,
      icono: CalendarClock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      nombre: "Ayudas entregadas",
      cantidad: ayudas.filter((a) => a.estado === "entregada").length,
      icono: PackageCheck,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-primary">
          Gestión de ayudas humanitarias
        </h2>
        <p className="mt-2 text-slate-500">
          Consulta, filtra y registra ayudas humanitarias.
        </p>
      </div>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {indicadores.map(({ nombre, cantidad, icono: Icono, color }) => (
          <article
            key={nombre}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className={`mb-4 inline-flex rounded-xl p-3 ${color}`}>
              <Icono size={24} />
            </div>

            <p className="text-3xl font-bold text-primary">{cantidad}</p>

            <p className="mt-1 text-sm text-slate-500">{nombre}</p>
          </article>
        ))}
      </section>

      <ListadoAyudas ayudas={ayudas} cargarDatos={cargarDatos} />

      <FormularioAyuda
        comunidades={comunidades}
        necesidades={necesidades}
        refreshOrganizaciones={versionOrganizaciones}
        onCreated={cargarDatos}
      />
    </div>
  );
}
