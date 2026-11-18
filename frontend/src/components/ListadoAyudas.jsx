import { useMemo, useState } from "react";
import { Filter, RotateCcw, Search } from "lucide-react";

import { PackageCheck } from "lucide-react";

import { useAuth } from "../context/useAuth";
import { apiFetch } from "../services/api";

import { showSuccess, showError, showConfirm } from "../utils/alerts";

const filtrosIniciales = {
  municipio: "",
  tipo: "",
  cantidadMin: "",
  cantidadMax: "",
  fecha: "",
  organizacion: "",
  estado: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-secondary focus:ring-2 focus:ring-teal-100";

function opcionesUnicas(valores) {
  return [...new Set(valores.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );
}

function fechaISO(fecha) {
  if (!fecha) return "";

  return String(fecha).slice(0, 10);
}

export default function ListadoAyudas({ ayudas = [], cargarDatos }) {
  const { token, usuario, esAdministrador } = useAuth();

  const [actualizando, setActualizando] = useState(null);
  const [filtros, setFiltros] = useState(filtrosIniciales);

  const municipios = useMemo(
    () => opcionesUnicas(ayudas.map((a) => a.municipio)),
    [ayudas],
  );

  const tipos = useMemo(
    () => opcionesUnicas(ayudas.map((a) => a.tipo_ayuda)),
    [ayudas],
  );

  const organizaciones = useMemo(
    () => opcionesUnicas(ayudas.map((a) => a.organizacion)),
    [ayudas],
  );

  const estados = useMemo(
    () => opcionesUnicas(ayudas.map((a) => a.estado)),
    [ayudas],
  );

  const ayudasFiltradas = useMemo(() => {
    return ayudas.filter((ayuda) => {
      const cantidad = Number(ayuda.cantidad);

      const municipioCoincide =
        !filtros.municipio || ayuda.municipio === filtros.municipio;

      const tipoCoincide = !filtros.tipo || ayuda.tipo_ayuda === filtros.tipo;

      const organizacionCoincide =
        !filtros.organizacion || ayuda.organizacion === filtros.organizacion;

      const estadoCoincide = !filtros.estado || ayuda.estado === filtros.estado;

      const fechaCoincide =
        !filtros.fecha || fechaISO(ayuda.fecha) === filtros.fecha;

      const cantidadMinCoincide =
        filtros.cantidadMin === "" || cantidad >= Number(filtros.cantidadMin);

      const cantidadMaxCoincide =
        filtros.cantidadMax === "" || cantidad <= Number(filtros.cantidadMax);

      return (
        municipioCoincide &&
        tipoCoincide &&
        organizacionCoincide &&
        estadoCoincide &&
        fechaCoincide &&
        cantidadMinCoincide &&
        cantidadMaxCoincide
      );
    });
  }, [ayudas, filtros]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function limpiarFiltros() {
    setFiltros({ ...filtrosIniciales });
  }

  const filtrosActivos = Object.values(filtros).some((valor) => valor !== "");

  function puedeActualizar(ayuda) {
    if (esAdministrador) {
      return true;
    }

    return (
      usuario?.rol === "organizacion" &&
      usuario?.organizacion_id != null &&
      String(usuario.organizacion_id) === String(ayuda.organizacion_id)
    );
  }

  async function actualizarEstado(ayuda, nuevoEstado) {
    const esEntrega = nuevoEstado === "entregada";

    const confirmado = await showConfirm({
      title: esEntrega
        ? "¿Confirmar entrega de la ayuda?"
        : "¿Restablecer ayuda a programada?",
      text: esEntrega
        ? "Confirma que la ayuda fue entregada a la comunidad."
        : "La ayuda volverá a estar pendiente de entrega.",
      confirmText: "Sí, confirmar",
      cancelText: "Cancelar",
    });

    if (!confirmado) return;

    setActualizando(ayuda.id_ayuda);

    try {
      const response = await apiFetch(
        `/api/ayudas/${ayuda.id_ayuda}/estado`,
        token,
        {
          method: "PATCH",
          body: JSON.stringify({
            estado: nuevoEstado,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      await cargarDatos();

      await showSuccess(
        "¡Estado actualizado!",
        esEntrega
          ? "La entrega se registró correctamente."
          : "La ayuda volvió al estado programada.",
      );
    } catch (error) {
      await showError("Error al actualizar ayuda", error.message);
    } finally {
      setActualizando(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-teal-50 p-3 text-secondary">
            <Filter size={22} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-primary">
              Consulta de ayudas humanitarias
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Utiliza los filtros para encontrar registros específicos.
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-100 bg-slate-50/70 p-6">
        <div className="mb-5 flex items-center gap-2">
          <Search size={17} className="text-secondary" />

          <h4 className="font-semibold text-primary">Filtros de búsqueda</h4>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Municipio</span>

            <select
              name="municipio"
              className={inputClass}
              value={filtros.municipio}
              onChange={handleChange}
            >
              <option value="">Todos los municipios</option>

              {municipios.map((municipio) => (
                <option key={municipio} value={municipio}>
                  {municipio}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Tipo de ayuda
            </span>

            <select
              name="tipo"
              className={inputClass}
              value={filtros.tipo}
              onChange={handleChange}
            >
              <option value="">Todos los tipos</option>

              {tipos.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Organización responsable
            </span>

            <select
              name="organizacion"
              className={inputClass}
              value={filtros.organizacion}
              onChange={handleChange}
            >
              <option value="">Todas las organizaciones</option>

              {organizaciones.map((organizacion) => (
                <option key={organizacion} value={organizacion}>
                  {organizacion}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Estado de atención
            </span>

            <select
              name="estado"
              className={inputClass}
              value={filtros.estado}
              onChange={handleChange}
            >
              <option value="">Todos los estados</option>

              {estados.map((estado) => (
                <option key={estado} value={estado}>
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Fecha de la ayuda
            </span>

            <input
              type="date"
              name="fecha"
              className={inputClass}
              value={filtros.fecha}
              onChange={handleChange}
            />
          </label>

          <div>
            <span className="mb-2 block text-sm font-medium">
              Cantidad de unidades
            </span>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                step="1"
                name="cantidadMin"
                className={inputClass}
                value={filtros.cantidadMin}
                onChange={handleChange}
                placeholder="Mínimo"
                aria-label="Cantidad mínima"
              />

              <input
                type="number"
                min="0"
                step="1"
                name="cantidadMax"
                className={inputClass}
                value={filtros.cantidadMax}
                onChange={handleChange}
                placeholder="Máximo"
                aria-label="Cantidad máxima"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Mostrando{" "}
            <strong className="text-primary">{ayudasFiltradas.length}</strong>{" "}
            de {ayudas.length} ayudas registradas
          </p>

          <button
            type="button"
            onClick={limpiarFiltros}
            disabled={!filtrosActivos}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={16} />
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-4">Comunidad</th>
              <th className="px-5 py-4">Municipio</th>
              <th className="px-5 py-4">Organización</th>
              <th className="px-5 py-4">Tipo de ayuda</th>
              <th className="px-5 py-4">Cantidad</th>
              <th className="px-5 py-4">Fecha</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {ayudasFiltradas.map((ayuda) => (
              <tr
                key={ayuda.id_ayuda}
                className="border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="px-5 py-4 font-medium text-primary">
                  {ayuda.comunidad}
                </td>

                <td className="px-5 py-4">{ayuda.municipio}</td>

                <td className="px-5 py-4">{ayuda.organizacion}</td>

                <td className="px-5 py-4">{ayuda.tipo_ayuda}</td>

                <td className="px-5 py-4">{ayuda.cantidad}</td>

                <td className="px-5 py-4">{fechaISO(ayuda.fecha)}</td>

                <td className="px-5 py-4">
                  <span
                    className={
                      ayuda.estado === "entregada"
                        ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                        : "rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"
                    }
                  >
                    {ayuda.estado}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {puedeActualizar(ayuda) &&
                      ayuda.estado === "programada" && (
                        <button
                          type="button"
                          title="Confirmar entrega"
                          aria-label="Confirmar entrega"
                          disabled={actualizando !== null}
                          onClick={() => actualizarEstado(ayuda, "entregada")}
                          className="rounded-lg bg-green-50 p-2.5 text-green-600 transition hover:bg-green-100 disabled:opacity-40"
                        >
                          <PackageCheck size={20} />
                        </button>
                      )}

                    {esAdministrador && ayuda.estado === "entregada" && (
                      <button
                        type="button"
                        title="Restablecer a programada"
                        aria-label="Restablecer a programada"
                        disabled={actualizando !== null}
                        onClick={() => actualizarEstado(ayuda, "programada")}
                        className="rounded-lg bg-amber-50 p-2.5 text-amber-600 transition hover:bg-amber-100 disabled:opacity-40"
                      >
                        <RotateCcw size={20} />
                      </button>
                    )}

                    {!puedeActualizar(ayuda) && (
                      <span className="text-xs text-slate-400">
                        Sin permisos
                      </span>
                    )}

                    {!esAdministrador &&
                      puedeActualizar(ayuda) &&
                      ayuda.estado === "entregada" && (
                        <span className="text-xs text-green-600">
                          Completada
                        </span>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ayudasFiltradas.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Search size={36} className="mx-auto mb-3 text-slate-300" />

            <p className="font-semibold text-primary">
              No se encontraron ayudas
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Modifica los filtros para consultar otros registros.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-xs text-slate-500">
        Información simulada para las pruebas del prototipo AyudasXCol.
      </div>
    </section>
  );
}
