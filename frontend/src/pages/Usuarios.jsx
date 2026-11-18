import { useCallback, useEffect, useState } from "react";
import { Users, ShieldCheck, Building2, Plus } from "lucide-react";

import { useAuth } from "../context/useAuth";
import { apiFetch } from "../services/api";
import { showError } from "../utils/alerts";
import FormularioUsuario from "../components/FormularioUsuario";

export default function Usuarios() {
  const { token } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [organizaciones, setOrganizaciones] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const consultarDatos = useCallback(
    async (signal) => {
      try {
        const respuestas = await Promise.all([
          apiFetch("/api/usuarios", token, { signal }),
          apiFetch("/api/organizaciones", token, { signal }),
        ]);

        if (respuestas.some((res) => !res.ok)) {
          throw new Error("No se pudieron consultar los datos.");
        }

        const [datosUsuarios, datosOrganizaciones] = await Promise.all(
          respuestas.map((res) => res.json()),
        );

        if (signal?.aborted) return;

        setErrorCarga("");
        setUsuarios(datosUsuarios);
        setOrganizaciones(datosOrganizaciones);
      } catch (error) {
        if (signal?.aborted) return;

        setErrorCarga(error.message);

        await showError("Error al consultar información", error.message);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) consultarDatos(controller.signal);
    });
    return () => controller.abort();
  }, [consultarDatos]);

  function cargarDatos() {
    setErrorCarga("");
    return consultarDatos();
  }

  const indicadores = [
    {
      nombre: "Usuarios registrados",
      cantidad: usuarios.length,
      icono: Users,
    },
    {
      nombre: "Administradores",
      cantidad: usuarios.filter((u) => u.rol === "administrador").length,
      icono: ShieldCheck,
    },
    {
      nombre: "Cuentas de organizaciones",
      cantidad: usuarios.filter((u) => u.rol === "organizacion").length,
      icono: Building2,
    },
  ];

  async function handleCreated() {
    setMostrarFormulario(false);
    await cargarDatos();
  }

  if (loading) {
    return (
      <p className="py-20 text-center text-slate-500">Cargando usuarios...</p>
    );
  }

  if (errorCarga) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl bg-red-50 p-4 text-red-700">{errorCarga}</p>
        <button
          onClick={cargarDatos}
          className="rounded-xl bg-secondary px-5 py-3 text-white"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary">
            Gestión de usuarios
          </h2>

          <p className="mt-2 text-slate-500">
            Administra las cuentas y permisos de AyudasXCol.
          </p>
        </div>

        <button
          onClick={() => setMostrarFormulario(true)}
          disabled={mostrarFormulario}
          className="flex items-center gap-2 rounded-xl bg-secondary px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          <Plus size={20} />
          Nuevo usuario
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {indicadores.map(({ nombre, cantidad, icono: Icono }) => (
          <article
            key={nombre}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 inline-flex rounded-xl bg-teal-50 p-3 text-secondary">
              <Icono size={24} />
            </div>

            <p className="text-3xl font-bold text-primary">{cantidad}</p>

            <p className="mt-1 text-sm text-slate-500">{nombre}</p>
          </article>
        ))}
      </div>

      {mostrarFormulario && (
        <FormularioUsuario
          organizaciones={organizaciones}
          onCreated={handleCreated}
          onCancel={() => setMostrarFormulario(false)}
        />
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h3 className="text-xl font-bold text-primary">
            Usuarios registrados
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4">Nombre</th>
                <th className="px-5 py-4">Correo</th>
                <th className="px-5 py-4">Rol</th>
                <th className="px-5 py-4">Organización</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((u) => (
                <tr
                  key={u.id_usuario}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-semibold text-primary">
                    {u.nombre}
                  </td>

                  <td className="px-5 py-4 text-slate-600">{u.correo}</td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        u.rol === "administrador"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-teal-100 text-teal-700"
                      }`}
                    >
                      {u.rol === "administrador"
                        ? "Administrador"
                        : "Organización"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {u.organizacion || "No aplica"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
