import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { apiFetch } from "../services/api";
import { showSuccess, showError } from "../utils/alerts";

const initialForm = {
  nombre: "",
  municipio: "",
  descripcion: "",
  latitud: "",
  longitud: "",
};

export default function FormularioComunidad({ onCreated }) {
  const { token } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

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

    const lat = Number(form.latitud);
    const lng = Number(form.longitud);

    if (
      !form.nombre.trim() ||
      !form.municipio.trim() ||
      !form.latitud.trim() ||
      !form.longitud.trim()
    ) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      setError("Ingresa coordenadas válidas.");
      return;
    }

    setGuardando(true);

    try {
      const response = await apiFetch("/api/comunidades", token, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          municipio: form.municipio.trim(),
          descripcion: form.descripcion.trim(),
          latitud: lat,
          longitud: lng,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo registrar la comunidad");
      }

      setForm(initialForm);

      if (onCreated) {
        await onCreated();
      }

      await showSuccess(
        "¡Comunidad registrada!",
        "La comunidad se guardó correctamente en AyudasXCol.",
      );
    } catch (err) {
      setError(err.message);

      await showError("Error al registrar comunidad", err.message);
    } finally {
      setGuardando(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-secondary focus:ring-2 focus:ring-teal-100";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-teal-50 p-3 text-secondary">
            <MapPin size={21} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-primary">
              Registrar comunidad
            </h3>
            <p className="text-sm text-slate-500">
              Agrega una comunidad al entorno de pruebas.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Nombre de la comunidad *
            </span>
            <input
              className={inputClass}
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej. Comunidad Los Pinos"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">Municipio *</span>
            <input
              className={inputClass}
              name="municipio"
              value={form.municipio}
              onChange={handleChange}
              placeholder="Ej. Espinal"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">Latitud *</span>
            <input
              className={inputClass}
              name="latitud"
              type="number"
              step="any"
              value={form.latitud}
              onChange={handleChange}
              placeholder="Ej. 4.1492"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">Longitud *</span>
            <input
              className={inputClass}
              name="longitud"
              type="number"
              step="any"
              value={form.longitud}
              onChange={handleChange}
              placeholder="Ej. -74.8843"
              required
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">Descripción</span>
          <textarea
            className={inputClass}
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={3}
            placeholder="Descripción general de la comunidad..."
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

        <button
          type="submit"
          disabled={guardando}
          className="flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={18} />
          {guardando ? "Guardando..." : "Registrar comunidad"}
        </button>
      </form>
    </section>
  );
}
