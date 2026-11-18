import MapaComunidades from "../components/MapaComunidades";
import FormularioComunidad from "../components/FormularioComunidad";
import { useAuth } from "../context/useAuth";

export default function Comunidades({ comunidades, cargarDatos }) {
  const { esAdministrador } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-primary">
          Gestión de comunidades
        </h2>
        <p className="mt-2 text-slate-500">
          Consulta las comunidades registradas y su ubicación.
        </p>
      </div>

      <MapaComunidades comunidades={comunidades} />

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-xl font-bold text-primary">
          Comunidades registradas ({comunidades.length})
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {comunidades.map((comunidad) => (
            <div
              key={comunidad.id_comunidad}
              className="rounded-xl border border-slate-100 bg-slate-50 p-5"
            >
              <h4 className="font-bold text-primary">{comunidad.nombre}</h4>
              <p className="mt-1 text-sm text-secondary">
                {comunidad.municipio}, Tolima
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {comunidad.descripcion || "Sin descripción"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {esAdministrador && <FormularioComunidad onCreated={cargarDatos} />}
    </div>
  );
}
