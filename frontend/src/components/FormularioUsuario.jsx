import { useState } from "react";
import { UserPlus, Eye, EyeOff } from "lucide-react";

import { useAuth } from "../context/useAuth";
import { apiFetch } from "../services/api";
import { showSuccess, showError } from "../utils/alerts";

const initialForm = {
  nombre: "",
  correo: "",
  contrasena: "",
  rol: "organizacion",
  organizacion_id: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-teal-100";

export default function FormularioUsuario({
  organizaciones = [],
  onCreated,
  onCancel,
}) {
  const { token } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [guardando, setGuardando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "rol" ? { organizacion_id: "" } : {}),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.contrasena.length < 12) {
      await showError(
        "Contraseña inválida",
        "La contraseña debe tener mínimo 12 caracteres.",
      );
      return;
    }

    if (form.rol === "organizacion" && !form.organizacion_id) {
      await showError("Organización requerida", "Selecciona una organización.");
      return;
    }

    setGuardando(true);

    try {
      const response = await apiFetch("/api/usuarios", token, {
        method: "POST",
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          correo: form.correo.trim(),
          contrasena: form.contrasena,
          rol: form.rol,
          organizacion_id:
            form.rol === "organizacion" ? Number(form.organizacion_id) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setForm(initialForm);

      await showSuccess(
        "¡Usuario registrado!",
        "La cuenta se creó correctamente en AyudasXCol.",
      );

      if (onCreated) {
        await onCreated();
      }
    } catch (error) {
      await showError("Error al registrar usuario", error.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 p-6">
        <div className="rounded-xl bg-teal-50 p-3 text-secondary">
          <UserPlus size={24} />
        </div>

        <div>
          <h3 className="text-xl font-bold text-primary">Registrar usuario</h3>
          <p className="text-sm text-slate-500">
            Crea una cuenta y asigna sus permisos.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium">
              Nombre completo *
            </span>

            <input
              name="nombre"
              className={inputClass}
              value={form.nombre}
              onChange={handleChange}
              maxLength={120}
              required
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">
              Correo electrónico *
            </span>

            <input
              type="email"
              name="correo"
              className={inputClass}
              value={form.correo}
              onChange={handleChange}
              maxLength={180}
              required
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Contraseña *</span>

            <div className="relative">
              <input
                type={mostrarContrasena ? "text" : "password"}
                name="contrasena"
                className={`${inputClass} pr-12`}
                value={form.contrasena}
                onChange={handleChange}
                placeholder="Mínimo 12 caracteres"
                autoComplete="new-password"
                minLength={12}
                required
              />

              <button
                type="button"
                onClick={() => setMostrarContrasena((prev) => !prev)}
                className="absolute right-4 top-3 text-slate-400"
                aria-label={
                  mostrarContrasena
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {mostrarContrasena ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">
              Rol del usuario *
            </span>

            <select
              name="rol"
              className={inputClass}
              value={form.rol}
              onChange={handleChange}
            >
              <option value="organizacion">Organización</option>
              <option value="administrador">Administrador</option>
            </select>
          </label>

          {form.rol === "organizacion" && (
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-medium">
                Organización vinculada *
              </span>

              <select
                name="organizacion_id"
                className={inputClass}
                value={form.organizacion_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar organización</option>

                {organizaciones.map((o) => (
                  <option key={o.id_organizacion} value={o.id_organizacion}>
                    {o.nombre}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={guardando}
            className="flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            <UserPlus size={18} />
            {guardando ? "Guardando..." : "Registrar usuario"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={guardando}
            className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
