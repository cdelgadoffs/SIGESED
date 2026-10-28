import { ApiError } from '../ApiError.js';

function noImplementado() {
  return Promise.reject(new ApiError('NO_IMPLEMENTADO', 'La conexión con el servidor aún no está implementada.'));
}

export const listarCatalogos = () => noImplementado();
export const obtenerPlantel = () => noImplementado();
export const guardarPlantel = () => noImplementado();
export const listarPersonal = () => noImplementado();
export const crearPersonal = () => noImplementado();
export const editarPersonal = () => noImplementado();
export const eliminarPersonal = () => noImplementado();
export const listarEstudiantes = () => noImplementado();
export const crearEstudiante = () => noImplementado();
export const editarEstudiante = () => noImplementado();
export const eliminarEstudiante = () => noImplementado();
export const listarCiclos = () => noImplementado();
export const crearCiclosAnuales = () => noImplementado();
