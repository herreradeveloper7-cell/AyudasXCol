import { useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { apiFetch } from "../services/api";
import { showSuccess, showError } from "../utils/alerts";

const initialForm = {
  comunidad_id: "",
  categoria: "",
  descripcion: "",
  cantidad_estimada: "",
};

const categorias = [
  "Alimentos",
  "Agua potable",
  "Medicamentos",
  "Ropa",
  "Elementos de aseo",
  "Material educativo",
  "Otros",
];

export default function FormularioNecesidad({ comunidades = [], onCreated }) {
  const { token } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMensaje("");

    const comunidadId = Number(form.comunidad_id);
    const cantidad = Number(form.cantidad_estimada);

    if (
      !Number.isSafeInteger(comunidadId) ||
      comunidadId <= 0 ||
      !form.categoria ||
      !form.descripcion.trim()
    ) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    if (
      form.cantidad_estimada === "" ||
      !Number.isSafeInteger(cantidad) ||
      cantidad <= 0
    ) {
      setError("La cantidad debe ser un número entero mayor que cero.");
      return;
    }

    setGuardando(true);

    try {
      const response = await apiFetch("/api/necesidades", token, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comunidad_id: comunidadId,
          categoria: form.categoria,
          descripcion: form.descripcion.trim(),
          cantidad_estimada: cantidad,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo registrar la necesidad");
      }

      setMensaje("Necesidad registrada correctamente.");

      setForm(initialForm);

      if (onCreated) {
        await onCreated();
      }

      await showSuccess(
        "¡Necesidad registrada!",
        "La necesidad humanitaria se guardó correctamente.",
      );
    } catch (err) {
      setError(err.message);

      await showError("Error al registrar necesidad", err.message);
    } finally {
      setGuardando(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-secondary focus:ring-2 focus:ring-teal-100";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
        <div className="rounded-xl bg-teal-50 p-3 text-secondary">
          <ClipboardList size={21} />
        </div>

        <div>
          <h3 className="text-lg font-bold text-primary">
            Registrar necesidad humanitaria
          </h3>

          <p className="text-sm text-slate-500">
            Asocia una necesidad a una comunidad registrada.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Comunidad *</span>

            <select
              className={inputClass}
              name="comunidad_id"
              value={form.comunidad_id}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar comunidad</option>

              {comunidades.map((comunidad) => (
                <option
                  key={comunidad.id_comunidad}
                  value={comunidad.id_comunidad}
                >
                  {comunidad.nombre} - {comunidad.municipio}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Tipo de necesidad *
            </span>

            <select
              className={inputClass}
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar categoría</option>

              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Cantidad estimada *
            </span>

            <input
              className={inputClass}
              name="cantidad_estimada"
              type="number"
              min="1"
              step="1"
              value={form.cantidad_estimada}
              onChange={handleChange}
              placeholder="Ej. 25"
              required
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">Descripción *</span>

          <textarea
            className={inputClass}
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={3}
            placeholder="Describe brevemente la necesidad identificada..."
            required
          />
        </label>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {mensaje && (
          <p
            role="status"
            className="rounded-lg bg-teal-50 p-3 text-sm text-teal-700"
          >
            {mensaje}
          </p>
        )}

        <button
          type="submit"
          disabled={guardando || comunidades.length === 0}
          className="flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={18} />
          {guardando ? "Guardando..." : "Registrar necesidad"}
        </button>
      </form>
    </section>
  );
}
