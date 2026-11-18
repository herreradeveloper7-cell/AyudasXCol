import { useCallback, useEffect, useState } from "react";
import { Building2, Mail, RefreshCw } from "lucide-react";

import FormularioOrganizacion from "../components/FormularioOrganizacion";
import { useAuth } from "../context/useAuth";
import { apiFetch } from "../services/api";
import { showError } from "../utils/alerts";

export default function Organizaciones({ onCreated }) {
  const { token, esAdministrador } = useAuth();
  const [organizaciones, setOrganizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  const consultarOrganizaciones = useCallback(
    async (signal) => {
      try {
        const response = await apiFetch("/api/organizaciones", token, {
          signal,
        });

        if (!response.ok) {
          throw new Error("No fue posible consultar las organizaciones.");
        }

        const data = await response.json();
        if (!signal?.aborted) setOrganizaciones(data);
      } catch (error) {
        if (signal?.aborted) return;

        await showError("Error al cargar organizaciones", error.message);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted)
        consultarOrganizaciones(controller.signal);
    });
    return () => controller.abort();
  }, [consultarOrganizaciones]);

  async function cargarOrganizaciones() {
    setActualizando(true);
    try {
      await consultarOrganizaciones();
    } finally {
      setActualizando(false);
    }
  }

  async function handleCreated() {
    await cargarOrganizaciones();

    if (onCreated) {
      onCreated();
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-primary">
          Gestión de organizaciones
        </h2>

        <p className="mt-2 text-slate-500">
          Consulta y registra las organizaciones participantes en AyudasXCol.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-6">
          <div>
            <h3 className="text-xl font-bold text-primary">
              Organizaciones registradas
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {organizaciones.length} organizaciones en la plataforma
            </p>
          </div>

          <button
            type="button"
            onClick={cargarOrganizaciones}
            disabled={loading || actualizando}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-primary hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading || actualizando ? "animate-spin" : ""}
            />
            Actualizar
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center text-slate-500">
              Cargando organizaciones...
            </p>
          ) : organizaciones.length === 0 ? (
            <div className="py-10 text-center">
              <Building2 size={40} className="mx-auto mb-3 text-slate-300" />

              <p className="font-semibold text-primary">
                No hay organizaciones registradas
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {organizaciones.map((organizacion) => (
                <article
                  key={organizacion.id_organizacion}
                  className="rounded-2xl border border-slate-200 p-5 transition hover:border-teal-300 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-teal-50 p-3 text-secondary">
                    <Building2 size={24} />
                  </div>

                  <h4 className="text-lg font-bold text-primary">
                    {organizacion.nombre}
                  </h4>

                  <p className="mt-2 min-h-12 text-sm text-slate-500">
                    {organizacion.descripcion || "Sin descripción disponible."}
                  </p>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <Mail
                        size={16}
                        className="mt-0.5 shrink-0 text-secondary"
                      />

                      <span className="break-all">
                        {organizacion.contacto_institucional ||
                          "Sin contacto institucional"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {esAdministrador && <FormularioOrganizacion onCreated={handleCreated} />}
    </div>
  );
}
