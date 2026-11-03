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
export const crearMateria = () => noImplementado();
export const listarEvaluaciones = () => noImplementado();
export const guardarEvaluacion = () => noImplementado();
export const listarGrupos = () => noImplementado();
export const crearGrupo = () => noImplementado();
export const editarGrupo = () => noImplementado();
export const eliminarGrupo = () => noImplementado();
export const configurarCiclo = () => noImplementado();
export const concluirCiclo = () => noImplementado();
export const iniciarCiclo = () => noImplementado();
export const listarInscripciones = () => noImplementado();
export const guardarInscripcion = () => noImplementado();
export const listarReportes = () => noImplementado();
export const crearReporte = () => noImplementado();
export const listarCalificacionesKardex = () => noImplementado();
export const crearCalificacionKardex = () => noImplementado();
export const editarCalificacionKardex = () => noImplementado();
export const eliminarCalificacionKardex = () => noImplementado();
export const listarKardex = () => noImplementado();
