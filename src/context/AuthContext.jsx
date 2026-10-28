import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [cuentaActiva] = useState(null);

  function iniciarSesion() {}
  function cerrarSesion() {}

  const value = { cuentaActiva, iniciarSesion, cerrarSesion };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
