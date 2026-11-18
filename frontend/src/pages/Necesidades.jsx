import { useState } from "react";
import {
  ClipboardList,
  Clock,
  ShieldCheck,
  XCircle,
  CheckCircle,
  RotateCcw,
} from "lucide-react";

import FormularioNecesidad from "../components/FormularioNecesidad";
import { useAuth } from "../context/useAuth";
import { apiFetch } from "../services/api";
import { showSuccess, showError, showConfirm } from "../utils/alerts";

const estilosEstado = {
  pendiente: "bg-amber-100 text-amber-700",
  verificado: "bg-green-100 text-green-700",
  rechazado: "bg-red-100 text-red-700",
};

export default function Necesidades({
  comunidades = [],
  necesidades = [],
  cargarDatos,
}) {
  const { token, esAdministrador } = useAuth();

  const [actualizando, setActualizando] = useState(null);

  const indicadores = [
    {
      nombre: "Total de necesidades",
      cantidad: necesidades.length,
      icono: ClipboardList,
      color: "bg-teal-50 text-secondary",
    },
    {
      nombre: "Pendientes",
      cantidad: necesidades.filter((n) => n.estado_verificacion === "pendiente")
        .length,
      icono: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      nombre: "Verificadas",
      cantidad: necesidades.filter(
        (n) => n.estado_verificacion === "verificado",
      ).length,
      icono: ShieldCheck,
      color: "bg-green-50 text-green-600",
    },
    {
      nombre: "Rechazadas",
      cantidad: necesidades.filter((n) => n.estado_verificacion === "rechazado")
        .length,
      icono: XCircle,
      color: "bg-red-50 text-red-600",
    },
  ];

  async function actualizarEstado(id, nuevoEstado) {
    const acciones = {
      verificado: "verificar",
      rechazado: "rechazar",
      pendiente: "volver a dejar pendiente",
    };

    const confirmado = await showConfirm({
      title: `¿Deseas ${acciones[nuevoEstado]} esta necesidad?`,
      text: "El estado de verificación será actualizado.",
      confirmText: "Sí, confirmar",
      cancelText: "Cancelar",
    });

    if (!confirmado) return;

    setActualizando(id);

    try {
      const response = await apiFetch(`/api/necesidades/${id}/estado`, token, {
        method: "PATCH",
        body: JSON.stringify({
          estado_verificacion: nuevoEstado,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      await cargarDatos();

      await showSuccess(
        "¡Estado actualizado!",
        "El estado de la necesidad se modificó correctamente.",
      );
    } catch (error) {
      await showError("Error al actualizar necesidad", error.message);
    } finally {
      setActualizando(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-primary">
          Necesidades humanitarias
        </h2>

        <p className="mt-2 text-slate-500">
          Consulta y realiza seguimiento a las necesidades registradas en las
          comunidades del Tolima.
        </p>
      </div>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h3 className="text-xl font-bold text-primary">
            Necesidades registradas
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {necesidades.length} registros disponibles
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4">Comunidad</th>
                <th className="px-5 py-4">Categoría</th>
                <th className="px-5 py-4">Descripción</th>
                <th className="px-5 py-4">Cantidad</th>
                <th className="px-5 py-4">Estado</th>

                {esAdministrador && <th className="px-5 py-4">Acciones</th>}
              </tr>
            </thead>

            <tbody>
              {necesidades.map((n) => {
                const comunidad = comunidades.find(
                  (c) => String(c.id_comunidad) === String(n.comunidad_id),
                );

                return (
                  <tr
                    key={n.id_necesidad}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-primary">
                        {n.comunidad || comunidad?.nombre || "No disponible"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {n.municipio || comunidad?.municipio}
                      </p>
                    </td>

                    <td className="px-5 py-4">{n.categoria}</td>

                    <td className="max-w-xs px-5 py-4 text-slate-500">
                      {n.descripcion}
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {n.cantidad_estimada ?? "Sin estimar"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                          estilosEstado[n.estado_verificacion] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {n.estado_verificacion}
                      </span>
                    </td>

                    {esAdministrador && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="Verificar necesidad"
                            aria-label="Verificar necesidad"
                            disabled={
                              actualizando !== null ||
                              n.estado_verificacion === "verificado"
                            }
                            onClick={() =>
                              actualizarEstado(n.id_necesidad, "verificado")
                            }
                            className="rounded-lg bg-green-50 p-2.5 text-green-600 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <CheckCircle size={19} />
                          </button>

                          <button
                            type="button"
                            title="Rechazar necesidad"
                            aria-label="Rechazar necesidad"
                            disabled={
                              actualizando !== null ||
                              n.estado_verificacion === "rechazado"
                            }
                            onClick={() =>
                              actualizarEstado(n.id_necesidad, "rechazado")
                            }
                            className="rounded-lg bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <XCircle size={19} />
                          </button>

                          <button
                            type="button"
                            title="Volver a pendiente"
                            aria-label="Volver a pendiente"
                            disabled={
                              actualizando !== null ||
                              n.estado_verificacion === "pendiente"
                            }
                            onClick={() =>
                              actualizarEstado(n.id_necesidad, "pendiente")
                            }
                            className="rounded-lg bg-amber-50 p-2.5 text-amber-600 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <RotateCcw size={19} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {necesidades.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <ClipboardList
                size={40}
                className="mx-auto mb-4 text-slate-300"
              />
              No hay necesidades registradas.
            </div>
          )}
        </div>
      </section>

      {esAdministrador && (
        <FormularioNecesidad
          comunidades={comunidades}
          onCreated={cargarDatos}
        />
      )}
    </div>
  );
}
