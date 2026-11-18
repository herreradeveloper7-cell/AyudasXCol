import { lazy, Suspense, useCallback, useEffect, useState } from "react";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/useAuth";

import Loading from "./components/Loading";
import ProtectedRoute from "./components/ProtectedRoute";
import PrivateLayout from "./layouts/PrivateLayout";
import { apiFetch } from "./services/api";

const Home = lazy(() => import("./pages/Home"));
const Comunidades = lazy(() => import("./pages/Comunidades"));
const Necesidades = lazy(() => import("./pages/Necesidades"));
const Organizaciones = lazy(() => import("./pages/Organizaciones"));
const Ayudas = lazy(() => import("./pages/Ayudas"));
const Usuarios = lazy(() => import("./pages/Usuarios"));
const Login = lazy(() => import("./pages/Login"));

export default function App() {
  const { autenticado, token, esAdministrador } = useAuth();

  return (
    <BrowserRouter>
      <ModulosSesion
        key={autenticado ? token : null}
        autenticado={autenticado}
        token={token}
        esAdministrador={esAdministrador}
      />
    </BrowserRouter>
  );
}

function ModulosSesion({ autenticado, token, esAdministrador }) {
  const [comunidades, setComunidades] = useState([]);
  const [necesidades, setNecesidades] = useState([]);
  const [ayudas, setAyudas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [versionOrganizaciones, setVersionOrganizaciones] = useState(0);

  const consultarDatos = useCallback(
    async (signal) => {
      try {
        const rutas = ["/api/comunidades", "/api/necesidades", "/api/ayudas"];

        const respuestas = await Promise.all(
          rutas.map((ruta) => apiFetch(ruta, token, { signal })),
        );

        if (respuestas.some((res) => !res.ok)) {
          throw new Error("No se pudieron consultar los datos");
        }

        const [datosComunidades, datosNecesidades, datosAyudas] =
          await Promise.all(respuestas.map((res) => res.json()));

        if (signal?.aborted) return;

        setError("");
        setComunidades(datosComunidades);
        setNecesidades(datosNecesidades);
        setAyudas(datosAyudas);
      } catch (err) {
        if (signal?.aborted) return;

        setError("No se pudo conectar con el backend.");

        console.error(err);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!autenticado) return;

    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) consultarDatos(controller.signal);
    });
    return () => controller.abort();
  }, [autenticado, consultarDatos]);

  function cargarDatos() {
    setError("");
    return consultarDatos();
  }

  function actualizarOrganizaciones() {
    setVersionOrganizaciones((version) => version + 1);
  }

  function renderPagina(pagina) {
    if (loading) {
      return <Loading mensaje="Cargando información de AyudasXCol..." />;
    }

    return (
      <>
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <Suspense fallback={<Loading />}>{pagina}</Suspense>
      </>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Suspense
            fallback={<Loading mensaje="Cargando inicio de sesión..." />}
          >
            <Login />
          </Suspense>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<PrivateLayout />}>
          <Route
            path="/usuarios"
            element={
              esAdministrador ? (
                renderPagina(<Usuarios />)
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/"
            element={renderPagina(
              <Home
                comunidades={comunidades}
                necesidades={necesidades}
                ayudas={ayudas}
              />,
            )}
          />

          <Route
            path="/comunidades"
            element={renderPagina(
              <Comunidades
                comunidades={comunidades}
                cargarDatos={cargarDatos}
              />,
            )}
          />

          <Route
            path="/necesidades"
            element={renderPagina(
              <Necesidades
                comunidades={comunidades}
                necesidades={necesidades}
                cargarDatos={cargarDatos}
              />,
            )}
          />

          <Route
            path="/organizaciones"
            element={renderPagina(
              <Organizaciones onCreated={actualizarOrganizaciones} />,
            )}
          />

          <Route
            path="/ayudas"
            element={renderPagina(
              <Ayudas
                comunidades={comunidades}
                necesidades={necesidades}
                ayudas={ayudas}
                cargarDatos={cargarDatos}
                versionOrganizaciones={versionOrganizaciones}
              />,
            )}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to={autenticado ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
