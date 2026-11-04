import { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as api from '../services/api.js';
import {
  carpetaGuardada, carpetaSoportada, elegirCarpeta, escribirArchivo, olvidarCarpeta, permisoCarpeta,
} from '../services/CarpetaLocal.js';
import { useAuth } from './AuthContext.jsx';
import { useRegistros } from './RegistrosContext.jsx';

const ROL_TI = 'administrador-ti';
const ESPERA_AUTOMATICA = 5000;

const RespaldosContext = createContext(null);

function nombreArchivo(fecha) {
  const d = new Date(fecha);
  const dia = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `sigesed-respaldo-${dia}.json`;
}

export function RespaldosProvider({ children }) {
  const { rolesSesion } = useAuth();
  const { CAMBIOS, recargarTodo } = useRegistros();
  const esTI = rolesSesion.includes(ROL_TI);
  const [carpeta, setCarpeta] = useState(null);
  const [conPermiso, setConPermiso] = useState(false);
  const [ultimoRespaldo, setUltimoRespaldo] = useState(null);
  const [errorAutomatico, setErrorAutomatico] = useState(null);
  const temporizador = useRef(null);
  const listo = useRef(false);

  useEffect(() => {
    let vigente = true;
    (async () => {
      const guardada = await carpetaGuardada();
      if (!vigente || !guardada) return;
      setCarpeta(guardada);
      setConPermiso(await permisoCarpeta(guardada));
    })();
    return () => { vigente = false; };
  }, []);

  async function escribirRespaldo(destino) {
    const respaldo = await api.exportarRespaldo();
    await escribirArchivo(destino, nombreArchivo(respaldo.generadoEn), JSON.stringify(respaldo, null, 2));
    setUltimoRespaldo(respaldo.generadoEn);
    setErrorAutomatico(null);
    return respaldo;
  }

  useEffect(() => {
    if (!listo.current) {
      listo.current = true;
      return undefined;
    }
    if (!carpeta || !conPermiso || !esTI) return undefined;
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => {
      escribirRespaldo(carpeta).catch((e) => setErrorAutomatico(e?.mensaje ?? 'No se pudo guardar el respaldo automático.'));
    }, ESPERA_AUTOMATICA);
    return () => clearTimeout(temporizador.current);
  }, [CAMBIOS, carpeta, conPermiso, esTI]);

  async function vincularCarpeta() {
    const elegida = await elegirCarpeta();
    setCarpeta(elegida);
    setConPermiso(true);
    await escribirRespaldo(elegida);
  }

  async function permitirAcceso() {
    if (!carpeta) return;
    const concedido = await permisoCarpeta(carpeta, true);
    setConPermiso(concedido);
    if (concedido) await escribirRespaldo(carpeta);
  }

  async function desvincularCarpeta() {
    clearTimeout(temporizador.current);
    await olvidarCarpeta();
    setCarpeta(null);
    setConPermiso(false);
    setErrorAutomatico(null);
  }

  async function respaldarAhora() {
    if (!carpeta || !conPermiso) return null;
    return escribirRespaldo(carpeta);
  }

  async function restaurarRespaldo(respaldo) {
    const resultado = await api.restaurarRespaldo(respaldo);
    await recargarTodo();
    return resultado;
  }

  const value = {
    carpetaSoportada: carpetaSoportada(),
    carpetaVinculada: carpeta ? { nombre: carpeta.name } : null,
    conPermiso,
    ultimoRespaldo,
    errorAutomatico,
    vincularCarpeta,
    permitirAcceso,
    desvincularCarpeta,
    respaldarAhora,
    restaurarRespaldo,
  };
  return <RespaldosContext.Provider value={value}>{children}</RespaldosContext.Provider>;
}

export function useRespaldos() {
  return useContext(RespaldosContext);
}
