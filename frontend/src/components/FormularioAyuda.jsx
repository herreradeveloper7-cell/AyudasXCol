import { useEffect, useState } from "react";
import { HandHeart, Plus } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { apiFetch } from "../services/api";
import { showSuccess, showError } from "../utils/alerts";

const initialForm = {
  comunidad_id: "",
  necesidad_id: "",
  organizacion_id: "",
  tipo_ayuda: "",
  cantidad: "",
  fecha: "",
  estado: "programada",
};

const tiposAyuda = [
  "Alimentos",
  "Agua potable",
  "Medicamentos",
  "Ropa",
  "Elementos de aseo",
  "Material educativo",
  "Otros",
];

export default function FormularioAyuda({
  comunidades = [],
  necesidades = [],
  onCreated,
  refreshOrganizaciones = 0,
}) {
  const { token, usuario, esOrganizacion } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [organizaciones, setOrganizaciones] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [errorOrganizaciones, setErrorOrganizaciones] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarOrganizaciones() {
      try {
        const response = await apiFetch("/api/organizaciones", token);

        if (!response.ok) {
          throw new Error("No se pudieron consultar las organizaciones");
        }

        const data = await response.json();

        if (activo) {
          setOrganizaciones(data);
          setErrorOrganizaciones("");
        }
      } catch (error) {
        if (activo) {
          setErrorOrganizaciones(error.message);
        }
      }
    }

    cargarOrganizaciones();

    return () => {
      activo = false;
    };
  }, [refreshOrganizaciones, token]);

  const necesidadesFiltradas = necesidades.filter(
    (necesidad) => String(necesidad.comunidad_id) === String(form.comunidad_id),
  );

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "comunidad_id" ? { necesidad_id: "" } : {}),
    }));
  }

  const organizacionesDisponibles = esOrganizacion
    ? organizaciones.filter(
        (o) => String(o.id_organizacion) === String(usuario?.organizacion_id),
      )
    : organizaciones;

  const organizacionSeleccionada = esOrganizacion
    ? String(usuario?.organizacion_id ?? "")
    : form.organizacion_id;

  async function handleSubmit(e) {
    e.preventDefault();

    const comunidadId = Number(form.comunidad_id);
    const organizacionId = Number(organizacionSeleccionada);
    const cantidad = Number(form.cantidad);

    if (
      !Number.isSafeInteger(comunidadId) ||
      comunidadId <= 0 ||
      !Number.isSafeInteger(organizacionId) ||
      organizacionId <= 0 ||
      !form.tipo_ayuda ||
      !form.fecha
    ) {
      await showError("Datos incompletos", "Completa los campos obligatorios.");
      return;
    }

    if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
      await showError(
        "Cantidad inválida",
        "La cantidad debe ser un número entero mayor que cero.",
      );
      return;
    }

    if (
      form.necesidad_id &&
      !necesidadesFiltradas.some(
        (n) => String(n.id_necesidad) === form.necesidad_id,
      )
    ) {
      await showError(
        "Necesidad inválida",
        "Selecciona una necesidad de la comunidad indicada.",
      );
      return;
    }

    setGuardando(true);

    try {
      const response = await apiFetch("/api/ayudas", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comunidad_id: comunidadId,
          necesidad_id: form.necesidad_id ? Number(form.necesidad_id) : null,
          organizacion_id: organizacionId,
          tipo_ayuda: form.tipo_ayuda,
          cantidad,
          fecha: form.fecha,
          estado: form.estado,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo registrar la ayuda.");
      }

      setForm(initialForm);

      if (onCreated) {
        await onCreated();
      }

      await showSuccess(
        "¡Ayuda registrada!",
        "La ayuda humanitaria se guardó correctamente.",
      );
    } catch (error) {
      await showError("Error al registrar la ayuda", error.message);
    } finally {
      setGuardando(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-secondary focus:ring-2 focus:ring-teal-100";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 p-6">
        <div className="rounded-xl bg-teal-50 p-3 text-secondary">
          <HandHeart size={22} />
        </div>

        <div>
          <h3 className="text-lg font-bold text-primary">
            Registrar ayuda humanitaria
          </h3>
          <p className="text-sm text-slate-500">
            Registra ayudas programadas o entregadas en el entorno de pruebas.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium">Comunidad *</span>
            <select
              className={inputClass}
              name="comunidad_id"
              value={form.comunidad_id}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar comunidad</option>
              {comunidades.map((c) => (
                <option key={c.id_comunidad} value={c.id_comunidad}>
                  {c.nombre} — {c.municipio}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">
              Necesidad relacionada (opcional)
            </span>
            <select
              className={inputClass}
              name="necesidad_id"
              value={form.necesidad_id}
              onChange={handleChange}
              disabled={!form.comunidad_id}
            >
              <option value="">Sin necesidad asociada</option>
              {necesidadesFiltradas.map((n) => (
                <option key={n.id_necesidad} value={n.id_necesidad}>
                  {n.categoria} — {n.cantidad_estimada} unidades
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">
              Organización responsable *
            </span>
            <select
              className={inputClass}
              name="organizacion_id"
              value={organizacionSeleccionada}
              onChange={handleChange}
              disabled={esOrganizacion}
              required
            >
              <option value="">Seleccionar organización</option>

              {organizacionesDisponibles.map((o) => (
                <option key={o.id_organizacion} value={o.id_organizacion}>
                  {o.nombre}
                </option>
              ))}
            </select>

            {esOrganizacion && (
              <p className="mt-2 text-xs text-slate-500">
                Las ayudas se registrarán en nombre de tu organización.
              </p>
            )}
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">
              Tipo de ayuda *
            </span>
            <select
              className={inputClass}
              name="tipo_ayuda"
              value={form.tipo_ayuda}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar tipo</option>
              {tiposAyuda.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Cantidad *</span>
            <input
              className={inputClass}
              type="number"
              name="cantidad"
              min="1"
              step="1"
              value={form.cantidad}
              onChange={handleChange}
              placeholder="Ej. 50"
              required
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Fecha *</span>
            <input
              className={inputClass}
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Estado *</span>
            <select
              className={inputClass}
              name="estado"
              value={form.estado}
              onChange={handleChange}
            >
              <option value="programada">Programada</option>
              <option value="entregada">Entregada</option>
            </select>
          </label>
        </div>

        {errorOrganizaciones && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {errorOrganizaciones}
          </p>
        )}

        <button
          type="submit"
          disabled={
            guardando ||
            comunidades.length === 0 ||
            organizacionesDisponibles.length === 0
          }
          className="flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          <Plus size={18} />
          {guardando ? "Guardando..." : "Registrar ayuda"}
        </button>
      </form>
    </section>
  );
}
