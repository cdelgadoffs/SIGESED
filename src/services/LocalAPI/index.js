import { ApiError } from '../ApiError.js';
import {
  STORE_CATALOGOS, STORE_UNICOS, STORE_PERSONAL, STORE_ESTUDIANTES, STORE_CICLOS,
  obtenerTodos, obtener, guardar, escribirVarios,
} from './db.js';
import {
  usuarioActual, exigirEscritura, prepararRegistro, exigirVersion,
  exigirPlantel, generarMatricula, ordenarPersonas, validarRolesDisponibles, ciclosDelAnio, ordenarCiclos,
} from './reglas.js';

const CLAVE_PLANTEL = 'plantel';

async function exigirExistente(store, id, mensaje) {
  const registro = id ? await obtener(store, id) : null;
  if (!registro) throw new ApiError('NO_ENCONTRADO', mensaje);
  return registro;
}

function nuevoRegistro(datos) {
  const ahora = new Date().toISOString();
  return { id: crypto.randomUUID(), ...datos, version: 1, creadoEn: ahora, creadoPor: usuarioActual().id, modificadoEn: ahora };
}

function registroEditado(actual, datos) {
  return { ...actual, ...datos, version: actual.version + 1, modificadoEn: new Date().toISOString() };
}

async function eliminar(store, id) {
  exigirEscritura();
  await exigirExistente(store, id, 'El registro no existe.');
  await escribirVarios({ borrar: [{ store, id }] });
  return { id };
}

export async function listarCatalogos() {
  const filas = await obtenerTodos(STORE_CATALOGOS);
  return Object.fromEntries(filas.map((f) => [f.nombre, f.items]));
}

export async function obtenerPlantel() {
  const guardado = await obtener(STORE_UNICOS, CLAVE_PLANTEL);
  if (!guardado) return null;
  const plantel = { ...guardado };
  delete plantel.clave;
  return plantel;
}

export async function guardarPlantel(version, datos) {
  exigirEscritura();
  const limpio = prepararRegistro('plantel', datos, await listarCatalogos());
  const actual = await obtenerPlantel();
  let plantel;
  if (actual) {
    exigirVersion(actual, version);
    plantel = registroEditado(actual, limpio);
  } else {
    plantel = nuevoRegistro(limpio);
  }
  await guardar(STORE_UNICOS, { clave: CLAVE_PLANTEL, ...plantel });
  return plantel;
}

async function validarPersona(tipo, datos, idPropio = null) {
  const catalogos = await listarCatalogos();
  const limpio = prepararRegistro(tipo, datos, catalogos);
  exigirPlantel(await obtenerPlantel());
  if (tipo === 'personal') {
    const otros = (await obtenerTodos(STORE_PERSONAL)).filter((p) => p.id !== idPropio);
    validarRolesDisponibles(limpio.roles, otros, catalogos);
  }
  return limpio;
}

export async function listarPersonal() {
  return ordenarPersonas((await obtenerTodos(STORE_PERSONAL)).map((p) => ({ ...p, roles: p.roles ?? [] })));
}

export async function crearPersonal(datos) {
  exigirEscritura();
  const registro = nuevoRegistro(await validarPersona('personal', datos));
  await guardar(STORE_PERSONAL, registro);
  return registro;
}

export async function editarPersonal(id, version, cambios) {
  exigirEscritura();
  const actual = await exigirExistente(STORE_PERSONAL, id, 'El registro no existe.');
  exigirVersion(actual, version);
  const registro = registroEditado(actual, await validarPersona('personal', { ...actual, ...cambios }, id));
  await guardar(STORE_PERSONAL, registro);
  return registro;
}

export function eliminarPersonal(id) {
  return eliminar(STORE_PERSONAL, id);
}

export async function listarEstudiantes() {
  return ordenarPersonas(await obtenerTodos(STORE_ESTUDIANTES));
}

export async function crearEstudiante(datos) {
  exigirEscritura();
  const limpio = await validarPersona('estudiante', datos);
  const existentes = new Set((await obtenerTodos(STORE_ESTUDIANTES)).map((e) => e.matricula));
  const registro = nuevoRegistro({ matricula: generarMatricula(limpio, existentes), ...limpio });
  await guardar(STORE_ESTUDIANTES, registro);
  return registro;
}

export async function editarEstudiante(id, version, cambios) {
  exigirEscritura();
  if (cambios && 'matricula' in cambios) throw new ApiError('VALIDACION', 'La matrícula no se puede cambiar.');
  const actual = await exigirExistente(STORE_ESTUDIANTES, id, 'El registro no existe.');
  exigirVersion(actual, version);
  const registro = registroEditado(actual, await validarPersona('estudiante', { ...actual, ...cambios }));
  await guardar(STORE_ESTUDIANTES, registro);
  return registro;
}

export function eliminarEstudiante(id) {
  return eliminar(STORE_ESTUDIANTES, id);
}

export async function listarCiclos() {
  return ordenarCiclos(await obtenerTodos(STORE_CICLOS));
}

export async function crearCiclosAnuales(anio) {
  exigirEscritura();
  const ciclos = ciclosDelAnio(anio);
  const existentes = new Set((await obtenerTodos(STORE_CICLOS)).map((c) => c.id));
  const ahora = new Date().toISOString();
  const nuevos = ciclos
    .filter((c) => !existentes.has(c.id))
    .map((c) => ({ ...c, creadoEn: ahora, creadoPor: usuarioActual().id }));
  await escribirVarios({ poner: nuevos.map((valor) => ({ store: STORE_CICLOS, valor })) });
  return listarCiclos();
}
