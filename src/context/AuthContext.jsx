import { createContext, useContext, useState } from 'react';
import { guardarRolesActivos, leerRolesActivos } from '../services/RolesLocales.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [cuentaActiva] = useState(null);
  const [rolesActivos, setRolesActivos] = useState(leerRolesActivos);

  function iniciarSesion() {}
  function cerrarSesion() {}

  function rolActivo(id) {
    return rolesActivos[id] !== false;
  }

  function alternarRol(id) {
    const siguiente = { ...rolesActivos, [id]: !rolActivo(id) };
    setRolesActivos(siguiente);
    guardarRolesActivos(siguiente);
  }

  const value = { cuentaActiva, iniciarSesion, cerrarSesion, rolActivo, alternarRol };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
