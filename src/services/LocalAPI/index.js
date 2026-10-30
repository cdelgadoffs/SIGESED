import { ApiError } from '../ApiError.js';
import {
  STORE_CATALOGOS, STORE_UNICOS, STORE_PERSONAL, STORE_ESTUDIANTES, STORE_CICLOS, STORE_EVALUACIONES, STORE_GRUPOS, STORE_REPORTES,
  obtenerTodos, obtener, guardar, escribirVarios,
} from './db.js';
import {
  usuarioActual, exigirEscritura, prepararRegistro, exigirVersion,
  exigirPlantel, generarMatricula, ordenarPersonas, validarRolesDisponibles, validarRolesAsignables, ciclosDelAnio, ordenarCiclos,
  prepararEvaluacion, idEvaluacion, conPromedio,
  gruposSegunRol, validarNombreGrupoUnico, ordenarGrupos,
  prepararConfiguracionCiclo, validarCicloSinEncimar, cicloConDerivados, hoyServidor, exigirCiclosAnterioresCerrados,
  validarFechaReporte, cicloDeFecha, ordenarReportes,
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
    const { id, version: v, creadoEn, creadoPor, modificadoEn } = actual;
    plantel = registroEditado({ id, version: v, creadoEn, creadoPor, modificadoEn }, limpio);
  } else {
    plantel = nuevoRegistro(limpio);
  }
  await guardar(STORE_UNICOS, { clave: CLAVE_PLANTEL, ...plantel });
  return plantel;
}

async function catalogosConGrupos() {
  return { ...(await listarCatalogos()), grupos: await obtenerTodos(STORE_GRUPOS) };
}

async function validarPersona(tipo, datos, idPropio = null) {
  const catalogos = await catalogosConGrupos();
  const limpio = prepararRegistro(tipo, datos, catalogos);
  exigirPlantel(await obtenerPlantel());
  if (tipo === 'personal') {
    const otros = (await obtenerTodos(STORE_PERSONAL)).filter((p) => p.id !== idPropio);
    validarRolesAsignables(limpio.roles, catalogos);
    validarRolesDisponibles(limpio.roles, otros, catalogos);
    return gruposSegunRol(limpio);
  }
  return limpio;
}

export async function listarGrupos() {
  return ordenarGrupos((await obtenerTodos(STORE_GRUPOS)).map((g) => ({ ...g, activo: g.activo ?? true })));
}

async function validarGrupo(datos, idPropio = null) {
  const limpio = prepararRegistro('grupo', datos, await listarCatalogos());
  exigirPlantel(await obtenerPlantel());
  validarNombreGrupoUnico(limpio.nombre, (await obtenerTodos(STORE_GRUPOS)).filter((g) => g.id !== idPropio));
  return limpio;
}

export async function crearGrupo(datos) {
  exigirEscritura();
  const registro = nuevoRegistro(await validarGrupo(datos));
  await guardar(STORE_GRUPOS, registro);
  return registro;
}

export async function editarGrupo(id, version, cambios) {
  exigirEscritura();
  const actual = await exigirExistente(STORE_GRUPOS, id, 'El grupo no existe.');
  exigirVersion(actual, version);
  const registro = registroEditado(actual, await validarGrupo({ activo: true, ...actual, ...cambios }, id));
  await guardar(STORE_GRUPOS, registro);
  return registro;
}

export async function eliminarGrupo(id) {
  const conAlumnos = (await obtenerTodos(STORE_ESTUDIANTES)).some((e) => e.grupo === id);
  const conPersonal = (await obtenerTodos(STORE_PERSONAL)).some((p) => (p.grupos || []).includes(id));
  if (conAlumnos || conPersonal) {
    throw new ApiError('EN_USO', 'No se puede eliminar: el grupo tiene estudiantes o personal asignado.');
  }
  return eliminar(STORE_GRUPOS, id);
}

export async function listarPersonal() {
  return ordenarPersonas((await obtenerTodos(STORE_PERSONAL)).map((p) => ({ ...p, roles: p.roles ?? [], grupos: p.grupos ?? [], activo: p.activo ?? true })));
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
  const registro = registroEditado(actual, await validarPersona('personal', { activo: true, ...actual, ...cambios }, id));
  await guardar(STORE_PERSONAL, registro);
  return registro;
}

export function eliminarPersonal(id) {
  return eliminar(STORE_PERSONAL, id);
}

export async function listarEstudiantes() {
  return ordenarPersonas((await obtenerTodos(STORE_ESTUDIANTES)).map((e) => ({ ...e, genero: e.genero ?? '', activo: e.activo ?? true })));
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
  const registro = registroEditado(actual, await validarPersona('estudiante', { activo: true, ...actual, ...cambios }));
  await guardar(STORE_ESTUDIANTES, registro);
  return registro;
}

export async function eliminarEstudiante(id) {
  const evaluaciones = await obtenerTodos(STORE_EVALUACIONES);
  if (evaluaciones.some((e) => e.estudianteId === id)) {
    throw new ApiError('CON_EVALUACIONES', 'No se puede eliminar: el estudiante tiene evaluaciones registradas.');
  }
  return eliminar(STORE_ESTUDIANTES, id);
}

export async function listarCiclos() {
  const { semanasCiclo = [] } = await listarCatalogos();
  const hoy = hoyServidor();
  return ordenarCiclos(await obtenerTodos(STORE_CICLOS)).map((c) => cicloConDerivados(c, semanasCiclo, hoy));
}

export async function configurarCiclo(id, version, datos) {
  exigirEscritura();
  const actual = await exigirExistente(STORE_CICLOS, id, 'El ciclo escolar no existe.');
  exigirVersion({ version: actual.version ?? 1 }, version);
  const todos = await listarCiclos();
  exigirCiclosAnterioresCerrados({ ...actual, cerrado: actual.cerrado ?? false }, todos);
  const { semanasCiclo = [] } = await listarCatalogos();
  const { fechaFin, ...limpio } = prepararConfiguracionCiclo(datos, semanasCiclo);
  validarCicloSinEncimar(id, limpio.fechaInicio, fechaFin, todos);
  const registro = { ...actual, ...limpio, version: (actual.version ?? 1) + 1, modificadoEn: new Date().toISOString() };
  await guardar(STORE_CICLOS, registro);
  return cicloConDerivados(registro, semanasCiclo, hoyServidor());
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

export async function concluirCiclo(id, version) {
  exigirEscritura();
  const actual = await exigirExistente(STORE_CICLOS, id, 'El ciclo escolar no existe.');
  exigirVersion({ version: actual.version ?? 1 }, version);
  if (!actual.fechaInicio) throw new ApiError('VALIDACION', 'Configura el ciclo antes de concluirlo.');
  if (actual.cerrado) throw new ApiError('VALIDACION', `El ciclo ${id} ya está concluido.`);
  const ahora = new Date().toISOString();
  const registro = { ...actual, cerrado: true, cerradoEn: ahora, cerradoPor: usuarioActual().id, version: (actual.version ?? 1) + 1, modificadoEn: ahora };
  await guardar(STORE_CICLOS, registro);
  const { semanasCiclo = [] } = await listarCatalogos();
  return cicloConDerivados(registro, semanasCiclo, hoyServidor());
}

export async function listarEvaluaciones() {
  return (await obtenerTodos(STORE_EVALUACIONES)).map(conPromedio);
}

export async function guardarEvaluacion(estudianteId, cicloId, version, datos) {
  exigirEscritura();
  const estudiante = await exigirExistente(STORE_ESTUDIANTES, estudianteId, 'El estudiante no existe.');
  await exigirExistente(STORE_CICLOS, cicloId, 'El ciclo escolar no existe.');
  const grupo = await exigirExistente(STORE_GRUPOS, estudiante.grupo, 'El estudiante no tiene un grupo válido.');
  const limpio = prepararEvaluacion(datos, grupo.programaEducativo, await listarCatalogos());
  const id = idEvaluacion(cicloId, estudianteId);
  const actual = await obtener(STORE_EVALUACIONES, id);
  let evaluacion;
  if (actual) {
    exigirVersion(actual, version);
    evaluacion = registroEditado(actual, limpio);
  } else {
    const ahora = new Date().toISOString();
    evaluacion = { id, estudianteId, cicloId, ...limpio, version: 1, creadoEn: ahora, creadoPor: usuarioActual().id, modificadoEn: ahora };
  }
  await guardar(STORE_EVALUACIONES, evaluacion);
  return conPromedio(evaluacion);
}

export async function listarReportes() {
  return ordenarReportes(await obtenerTodos(STORE_REPORTES));
}

export async function crearReporte(datos) {
  exigirEscritura();
  if (!datos || typeof datos !== 'object') throw new ApiError('VALIDACION', 'Faltan los datos del reporte.');
  const estudiante = await exigirExistente(STORE_ESTUDIANTES, datos.estudianteId, 'El estudiante no existe.');
  if (estudiante.activo === false) throw new ApiError('VALIDACION', 'No se pueden levantar reportes a un estudiante inactivo.');
  const fecha = validarFechaReporte(datos.fecha, hoyServidor());
  const limpio = prepararRegistro('reporte', datos, await listarCatalogos());
  const registro = {
    id: crypto.randomUUID(),
    estudianteId: datos.estudianteId,
    fecha,
    ...limpio,
    cicloId: cicloDeFecha(fecha, await listarCiclos()),
    creadoEn: new Date().toISOString(),
    creadoPor: usuarioActual().id,
  };
  await guardar(STORE_REPORTES, registro);
  return registro;
}
