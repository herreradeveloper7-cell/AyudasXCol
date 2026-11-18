import { useEffect, useState } from "react";
import { AuthContext } from "./useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null);

  const usuario = sesion?.usuario ?? null;
  const token = sesion?.token ?? null;

  async function login(correo, contrasena) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        correo,
        contrasena,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "No fue posible iniciar sesión.");
    }

    setSesion({
      usuario: data.usuario,
      token: data.token,
      expiresAt: Date.now() + 2 * 60 * 60 * 1000,
    });

    return data.usuario;
  }

  function logout() {
    setSesion(null);
  }

  useEffect(() => {
    if (!sesion) return;

    const tiempoRestante = Math.max(0, sesion.expiresAt - Date.now());

    const timeout = setTimeout(() => {
      setSesion(null);
    }, tiempoRestante);

    return () => clearTimeout(timeout);
  }, [sesion]);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        autenticado: Boolean(usuario && token),
        esAdministrador: usuario?.rol === "administrador",
        esOrganizacion: usuario?.rol === "organizacion",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
