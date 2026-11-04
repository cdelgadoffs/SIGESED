import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../services/api.js';
import { consumirMarcaSalida, entrarConMicrosoft, olvidarCuentaMicrosoft, recuperarSesionMicrosoft, salirDeMicrosoft } from '../services/AutenticacionEntra.js';
import { guardarCredencialGoogle, mostrarBotonGoogle, recuperarSesionGoogle, salirDeGoogle } from '../services/AutenticacionGoogle.js';
import { guardarRolesActivos, leerRolesActivos } from '../services/RolesLocales.js';

const AuthContext = createContext(null);
const NIVELES = { ninguno: 0, ver: 1, propio: 2, editar: 3 };

export function AuthProvider({ children }) {
  const [cuentaActiva, setCuentaActiva] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [errorAcceso, setErrorAcceso] = useState(null);
  const [sesionCerrada, setSesionCerrada] = useState(consumirMarcaSalida);
  const [rolesActivos, setRolesActivos] = useState(leerRolesActivos);

  useEffect(() => {
    let vigente = true;
    (async () => {
      try {
        const credencial = recuperarSesionGoogle();
        let cuenta = credencial ? await api.iniciarSesionGoogle(credencial).catch(() => null) : null;
        if (!cuenta && credencial) await salirDeGoogle();
        if (!cuenta) {
          const token = await recuperarSesionMicrosoft();
          cuenta = token ? await api.iniciarSesionEntra(token) : null;
        }
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

  async function recibirCredencialGoogle(credencial) {
    setErrorAcceso(null);
    try {
      const cuenta = await api.iniciarSesionGoogle(credencial);
      guardarCredencialGoogle(credencial);
      setCuentaActiva(cuenta);
    } catch (e) {
      setErrorAcceso(e?.mensaje ?? 'No se pudo acceder con Google.');
    }
  }

  async function prepararAccesoGoogle(elemento) {
    try {
      await mostrarBotonGoogle(elemento, recibirCredencialGoogle);
    } catch (e) {
      setErrorAcceso(e?.mensaje ?? 'No se pudo cargar el acceso con Google.');
    }
  }

  async function cerrarSesion() {
    const proveedor = cuentaActiva?.proveedor;
    await api.cerrarSesion().catch(() => {});
    setCuentaActiva(null);
    setErrorAcceso(null);
    if (proveedor === 'google') {
      await salirDeGoogle();
      setSesionCerrada(true);
      return;
    }
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

  function puede(modulo, nivel = 'ver') {
    const porRol = cuentaActiva?.permisosPorRol ?? {};
    return (cuentaActiva?.roles ?? []).some((rol) => {
      if (!rolActivo(rol)) return false;
      const permisos = porRol[rol] ?? {};
      return (NIVELES[permisos[modulo] ?? permisos['*']] ?? 0) >= NIVELES[nivel];
    });
  }

  const value = {
    puede,
    cuentaActiva,
    cargandoSesion,
    rolesSesion: cuentaActiva?.roles ?? [],
    iniciarSesionMicrosoft,
    prepararAccesoGoogle,
    errorAcceso,
    sesionCerrada,
    descartarAvisoSesion: () => setSesionCerrada(false),
    cerrarSesion,
    rolActivo,
    alternarRol,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
