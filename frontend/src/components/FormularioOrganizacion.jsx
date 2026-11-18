import { useState } from "react";
import { Building2, Plus } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { apiFetch } from "../services/api";
import { showSuccess, showError } from "../utils/alerts";

const initialForm = {
  nombre: "",
  descripcion: "",
  contacto_institucional: "",
};

export default function FormularioOrganizacion({ onCreated }) {
  const { token } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [guardando, setGuardando] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.nombre.trim()) {
      await showError(
        "Datos incompletos",
        "Debes ingresar el nombre de la organización.",
      );
      return;
    }

    setGuardando(true);

    try {
      const response = await apiFetch("/api/organizaciones", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          contacto_institucional: form.contacto_institucional.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "No se pudo registrar la organización.",
        );
      }

      setForm(initialForm);

      if (onCreated) {
        await onCreated();
      }

      await showSuccess(
        "¡Organización registrada!",
        "La organización se guardó correctamente.",
      );
    } catch (error) {
      await showError("Error al registrar organización", error.message);
    } finally {
      setGuardando(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-teal-100";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 p-6">
        <div className="rounded-xl bg-teal-50 p-3 text-secondary">
          <Building2 size={22} />
        </div>

        <div>
          <h3 className="text-lg font-bold text-primary">
            Registrar organización
          </h3>
          <p className="text-sm text-slate-500">
            Organizaciones simuladas para las pruebas.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Nombre de la organización *
            </span>
            <input
              className={inputClass}
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej. Fundación Demo Tolima"
              maxLength={150}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Contacto institucional *
            </span>
            <input
              type="email"
              className={inputClass}
              name="contacto_institucional"
              value={form.contacto_institucional}
              onChange={handleChange}
              placeholder="correo@organizacion.com"
              maxLength={180}
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
            placeholder="Descripción general..."
          />
        </label>

        <button
          type="submit"
          disabled={guardando}
          className="flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          <Plus size={18} />
          {guardando ? "Guardando..." : "Registrar organización"}
        </button>
      </form>
    </section>
  );
}
