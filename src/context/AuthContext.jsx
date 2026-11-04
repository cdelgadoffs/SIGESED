import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../services/api.js';
import { entrarConMicrosoft, olvidarCuentaMicrosoft, recuperarSesionMicrosoft, salirDeMicrosoft } from '../services/AutenticacionEntra.js';
import { guardarRolesActivos, leerRolesActivos } from '../services/RolesLocales.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [cuentaActiva, setCuentaActiva] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [rolesActivos, setRolesActivos] = useState(leerRolesActivos);

  useEffect(() => {
    let vigente = true;
    (async () => {
      try {
        const token = await recuperarSesionMicrosoft();
        const cuenta = token ? await api.iniciarSesionEntra(token) : null;
        if (vigente) setCuentaActiva(cuenta);
      } catch {
        if (vigente) setCuentaActiva(null);
      } finally {
        if (vigente) setCargandoSesion(false);
      }
    })();
    return () => { vigente = false; };
  }, []);

  async function iniciarSesionMicrosoft() {
    const token = await entrarConMicrosoft();
    try {
      const cuenta = await api.iniciarSesionEntra(token);
      setCuentaActiva(cuenta);
      return cuenta;
    } catch (e) {
      await olvidarCuentaMicrosoft().catch(() => {});
      throw e;
    }
  }

  async function cerrarSesion() {
    await api.cerrarSesion().catch(() => {});
    setCuentaActiva(null);
    await salirDeMicrosoft().catch(() => {});
  }

  function rolActivo(id) {
    return rolesActivos[id] !== false;
  }

  function alternarRol(id) {
    const siguiente = { ...rolesActivos, [id]: !rolActivo(id) };
    setRolesActivos(siguiente);
    guardarRolesActivos(siguiente);
  }

  const value = {
    cuentaActiva,
    cargandoSesion,
    rolesSesion: cuentaActiva?.roles ?? [],
    iniciarSesionMicrosoft,
    cerrarSesion,
    rolActivo,
    alternarRol,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
