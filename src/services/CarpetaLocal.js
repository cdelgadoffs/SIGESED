import { eliminarCarpeta, guardarCarpeta, obtenerCarpeta } from './SesionIndexedDB.js';
import { ApiError } from './ApiError.js';

const CLAVE = 'respaldos';

export function carpetaSoportada() {
  return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';
}

export async function elegirCarpeta() {
  if (!carpetaSoportada()) throw new ApiError('NO_DISPONIBLE', 'Este navegador no permite vincular carpetas. Usa Chrome o Edge de escritorio.');
  try {
    const carpeta = await window.showDirectoryPicker({ id: 'sigesed-respaldos', mode: 'readwrite' });
    await guardarCarpeta(CLAVE, carpeta);
    return carpeta;
  } catch (e) {
    if (e?.name === 'AbortError') throw new ApiError('CANCELADO', 'No se eligió ninguna carpeta.');
    throw new ApiError('NO_DISPONIBLE', 'No se pudo vincular la carpeta.');
  }
}

export async function carpetaGuardada() {
  if (!carpetaSoportada()) return null;
  try {
    return await obtenerCarpeta(CLAVE);
  } catch {
    return null;
  }
}

export async function olvidarCarpeta() {
  await eliminarCarpeta(CLAVE).catch(() => {});
}

export async function permisoCarpeta(carpeta, pedir = false) {
  const opciones = { mode: 'readwrite' };
  try {
    if ((await carpeta.queryPermission(opciones)) === 'granted') return true;
    if (!pedir) return false;
    return (await carpeta.requestPermission(opciones)) === 'granted';
  } catch {
    return false;
  }
}

export async function escribirArchivo(carpeta, nombre, texto) {
  try {
    const archivo = await carpeta.getFileHandle(nombre, { create: true });
    const escritor = await archivo.createWritable();
    await escritor.write(texto);
    await escritor.close();
  } catch {
    throw new ApiError('NO_DISPONIBLE', 'No se pudo escribir el respaldo en la carpeta. Revisa que siga existiendo y que haya permiso.');
  }
}
