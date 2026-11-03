import { ApiError } from '../ApiError.js';
import {
  STORE_CATALOGOS, STORE_UNICOS, STORE_PERSONAL, STORE_ESTUDIANTES, STORE_CICLOS, STORE_EVALUACIONES, STORE_GRUPOS, STORE_REPORTES, STORE_INSCRIPCIONES, STORE_KARDEX,
  obtenerTodos, obtener, guardar, escribirVarios,
} from './db.js';
import {
  usuarioActual, exigirEscritura, prepararRegistro, exigirVersion,
  exigirPlantel, generarMatricula, ordenarPersonas, validarRolesDisponibles, validarRolesAsignables, ciclosDelAnio, ordenarCiclos,
  prepararEvaluacion, idEvaluacion, conPromedio,
  validarNombreGrupoUnico, ordenarGrupos,
  prepararConfiguracionCiclo, validarCicloSinEncimar, cicloConDerivados, hoyServidor,
  exigirCicloPreparable, prepararInscripcion, validarDocentesSinChoque, pendientesDeInicio, idInscripcion,
  validarFechaReporte, cicloDeFecha, ordenarReportes,
  prepararCalificacionKardex, validarMateriaKardexUnica, armarKardex, materiasAcreditadas, exigirNoAcreditadas, prepararMateriaManual,
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

export async function crearMateria(datos) {
  exigirEscritura();
  const { programasEducativos = [], materias = [] } = await listarCatalogos();
  const materia = prepararMateriaManual(datos, programasEducativos, materias);
  await guardar(STORE_CATALOGOS, { nombre: 'materias', items: [...materias, materia] });
  return materia;
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
  const inscrito = (await obtenerTodos(STORE_INSCRIPCIONES)).some((i) => i.grupoId === id);
  if (conAlumnos || inscrito) {
    throw new ApiError('EN_USO', 'No se puede eliminar: el grupo tiene estudiantes o está inscrito en algún ciclo escolar.');
  }
  return eliminar(STORE_GRUPOS, id);
}

export async function listarPersonal() {
  return ordenarPersonas((await obtenerTodos(STORE_PERSONAL)).map((p) => ({ ...p, roles: p.roles ?? [], activo: p.activo ?? true })));
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

export async function eliminarPersonal(id) {
  const inscripciones = await obtenerTodos(STORE_INSCRIPCIONES);
  if (inscripciones.some((i) => i.materias.some((m) => m.docenteId === id))) {
    throw new ApiError('EN_USO', 'No se puede eliminar: es docente de materias inscritas en algún ciclo escolar.');
  }
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
  const kardex = await obtenerTodos(STORE_KARDEX);
  if (kardex.some((k) => k.estudianteId === id)) {
    throw new ApiError('CON_EVALUACIONES', 'No se puede eliminar: el estudiante tiene calificaciones en su kárdex.');
  }
  return eliminar(STORE_ESTUDIANTES, id);
}

async function datosPreparacion() {
  return {
    catalogos: await listarCatalogos(),
    grupos: await obtenerTodos(STORE_GRUPOS),
    inscripciones: await obtenerTodos(STORE_INSCRIPCIONES),
    personal: await obtenerTodos(STORE_PERSONAL),
  };
}

function cicloParaEntregar(guardado, datos, hoy) {
  const ciclo = cicloConDerivados(guardado, datos.catalogos.semanasCiclo || [], hoy);
  return { ...ciclo, pendientesInicio: pendientesDeInicio(ciclo, datos, hoy) };
}

async function entregarCiclo(guardado) {
  return cicloParaEntregar(guardado, await datosPreparacion(), hoyServidor());
}

export async function listarCiclos() {
  const datos = await datosPreparacion();
  const hoy = hoyServidor();
  return ordenarCiclos(await obtenerTodos(STORE_CICLOS)).map((c) => cicloParaEntregar(c, datos, hoy));
}

export async function configurarCiclo(id, version, datos) {
  exigirEscritura();
  const actual = await exigirExistente(STORE_CICLOS, id, 'El ciclo escolar no existe.');
  exigirVersion({ version: actual.version ?? 1 }, version);
  const todos = await listarCiclos();
  exigirCicloPreparable({ ...actual, cerrado: actual.cerrado ?? false }, todos);
  const { semanasCiclo = [] } = await listarCatalogos();
  const { fechaFin, ...limpio } = prepararConfiguracionCiclo(datos, semanasCiclo);
  validarCicloSinEncimar(id, limpio.fechaInicio, fechaFin, todos);
  const registro = { ...actual, ...limpio, version: (actual.version ?? 1) + 1, modificadoEn: new Date().toISOString() };
  await guardar(STORE_CICLOS, registro);
  return entregarCiclo(registro);
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
  return entregarCiclo(registro);
}

export async function iniciarCiclo(id, version) {
  exigirEscritura();
  const actual = await exigirExistente(STORE_CICLOS, id, 'El ciclo escolar no existe.');
  exigirVersion({ version: actual.version ?? 1 }, version);
  if (actual.cerrado) throw new ApiError('VALIDACION', `El ciclo ${id} ya está concluido.`);
  exigirCicloPreparable(actual, await listarCiclos());
  const { pendientesInicio } = await entregarCiclo(actual);
  if (pendientesInicio.length > 0) {
    const grupos = await obtenerTodos(STORE_GRUPOS);
    const conGrupo = (p) => (p.grupoId ? `${grupos.find((g) => g.id === p.grupoId)?.nombre ?? p.grupoId}: ${p.mensaje}` : p.mensaje);
    throw new ApiError('CICLO_INCOMPLETO', `Aún no se puede iniciar el ciclo ${id}. ${pendientesInicio.map(conGrupo).join(' ')}`);
  }
  const ahora = new Date().toISOString();
  const registro = { ...actual, iniciado: true, iniciadoEn: ahora, iniciadoPor: usuarioActual().id, version: (actual.version ?? 1) + 1, modificadoEn: ahora };
  await guardar(STORE_CICLOS, registro);
  return entregarCiclo(registro);
}

export async function listarInscripciones() {
  return obtenerTodos(STORE_INSCRIPCIONES);
}

export async function guardarInscripcion(cicloId, grupoId, version, datos) {
  exigirEscritura();
  const ciclo = await exigirExistente(STORE_CICLOS, cicloId, 'El ciclo escolar no existe.');
  const grupo = await exigirExistente(STORE_GRUPOS, grupoId, 'El grupo no existe.');
  if (ciclo.cerrado) throw new ApiError('VALIDACION', `El ciclo ${cicloId} ya se concluyó y no se puede modificar.`);
  exigirCicloPreparable(ciclo, await listarCiclos());
  if (grupo.activo === false) throw new ApiError('VALIDACION', `El grupo ${grupo.nombre} está inactivo: solo se inscriben grupos activos.`);
  const { catalogos, grupos, inscripciones, personal } = await datosPreparacion();
  const limpio = prepararInscripcion(datos, grupo, catalogos, personal);
  const id = idInscripcion(cicloId, grupoId);
  const otras = inscripciones.filter((i) => i.cicloId === cicloId && i.id !== id);
  validarDocentesSinChoque(limpio.materias, otras, grupos, personal, catalogos);
  const actual = inscripciones.find((i) => i.id === id);
  let inscripcion;
  if (actual) {
    exigirVersion(actual, version);
    inscripcion = registroEditado(actual, limpio);
  } else {
    const ahora = new Date().toISOString();
    inscripcion = { id, cicloId, grupoId, ...limpio, version: 1, creadoEn: ahora, creadoPor: usuarioActual().id, modificadoEn: ahora };
  }
  await guardar(STORE_INSCRIPCIONES, inscripcion);
  return inscripcion;
}

async function acreditadasFuera(estudianteId, cicloId) {
  const [registros, evaluaciones, ciclos] = await Promise.all([obtenerTodos(STORE_KARDEX), obtenerTodos(STORE_EVALUACIONES), obtenerTodos(STORE_CICLOS)]);
  return materiasAcreditadas(estudianteId, registros, evaluaciones, ciclos, { excluirCicloId: cicloId });
}

async function materiasInscritasDe(estudianteId, cicloId) {
  const estudiante = await obtener(STORE_ESTUDIANTES, estudianteId);
  const inscripcion = estudiante ? await obtener(STORE_INSCRIPCIONES, idInscripcion(cicloId, estudiante.grupo)) : null;
  const fuera = await acreditadasFuera(estudianteId, cicloId);
  return (inscripcion?.materias ?? []).filter((m) => !fuera.has(m.materia)).length;
}

export async function listarEvaluaciones() {
  const evaluaciones = await obtenerTodos(STORE_EVALUACIONES);
  return Promise.all(evaluaciones.map(async (e) => conPromedio(e, await materiasInscritasDe(e.estudianteId, e.cicloId))));
}

export async function guardarEvaluacion(estudianteId, cicloId, version, datos) {
  exigirEscritura();
  const estudiante = await exigirExistente(STORE_ESTUDIANTES, estudianteId, 'El estudiante no existe.');
  const ciclo = await exigirExistente(STORE_CICLOS, cicloId, 'El ciclo escolar no existe.');
  if (!ciclo.iniciado) throw new ApiError('VALIDACION', `El ciclo ${cicloId} aún no se inicia: las evaluaciones se capturan en un ciclo iniciado.`);
  const grupo = await exigirExistente(STORE_GRUPOS, estudiante.grupo, 'El estudiante no tiene un grupo válido.');
  const inscripcion = await obtener(STORE_INSCRIPCIONES, idInscripcion(cicloId, grupo.id));
  const inscritas = new Set((inscripcion?.materias ?? []).map((m) => m.materia));
  const { materias = [] } = await listarCatalogos();
  const limpio = prepararEvaluacion(datos, materias.filter((m) => inscritas.has(m.id)));
  const fuera = await acreditadasFuera(estudianteId, cicloId);
  exigirNoAcreditadas(limpio.calificaciones.map((c) => c.materia), fuera, (id) => materias.find((m) => m.id === id)?.nombre ?? id);
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
  return conPromedio(evaluacion, [...inscritas].filter((m) => !fuera.has(m)).length);
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

async function materiasDelEstudiante(estudianteId) {
  const estudiante = await exigirExistente(STORE_ESTUDIANTES, estudianteId, 'El estudiante no existe.');
  const grupo = await exigirExistente(STORE_GRUPOS, estudiante.grupo, 'El estudiante no tiene un grupo válido.');
  const { materias = [] } = await listarCatalogos();
  return materias.filter((m) => m.programaEducativo === grupo.programaEducativo);
}

async function prepararKardex(estudianteId, datos, idActual) {
  const permitidas = await materiasDelEstudiante(estudianteId);
  const limpio = prepararCalificacionKardex(datos, permitidas);
  const nombre = permitidas.find((m) => m.id === limpio.materia).nombre;
  const registros = await obtenerTodos(STORE_KARDEX);
  validarMateriaKardexUnica(registros, estudianteId, limpio.materia, nombre, idActual);
  const [evaluaciones, ciclos] = await Promise.all([obtenerTodos(STORE_EVALUACIONES), obtenerTodos(STORE_CICLOS)]);
  exigirNoAcreditadas([limpio.materia], materiasAcreditadas(estudianteId, registros, evaluaciones, ciclos, { excluirRegistroId: idActual }), () => nombre);
  return limpio;
}

export async function listarCalificacionesKardex() {
  return obtenerTodos(STORE_KARDEX);
}

export async function crearCalificacionKardex(datos) {
  exigirEscritura();
  if (!datos || typeof datos !== 'object') throw new ApiError('VALIDACION', 'Faltan los datos de la calificación.');
  const limpio = await prepararKardex(datos.estudianteId, datos);
  const registro = nuevoRegistro({ estudianteId: datos.estudianteId, ...limpio });
  await guardar(STORE_KARDEX, registro);
  return registro;
}

export async function editarCalificacionKardex(id, version, cambios) {
  exigirEscritura();
  const actual = await exigirExistente(STORE_KARDEX, id, 'La calificación no existe.');
  exigirVersion(actual, version);
  const limpio = await prepararKardex(actual.estudianteId, { ...actual, ...cambios }, id);
  const registro = registroEditado(actual, limpio);
  await guardar(STORE_KARDEX, registro);
  return registro;
}

export async function eliminarCalificacionKardex(id) {
  return eliminar(STORE_KARDEX, id);
}

export async function listarKardex() {
  const [registros, evaluaciones, ciclos, estudiantes, inscripciones, { materias = [] }] = await Promise.all([
    obtenerTodos(STORE_KARDEX), obtenerTodos(STORE_EVALUACIONES), obtenerTodos(STORE_CICLOS),
    obtenerTodos(STORE_ESTUDIANTES), obtenerTodos(STORE_INSCRIPCIONES), listarCatalogos(),
  ]);
  const grupoDe = new Map(estudiantes.map((e) => [e.id, e.grupo]));
  const ids = new Set([...registros.map((r) => r.estudianteId), ...evaluaciones.map((e) => e.estudianteId)]);
  return [...ids].map((id) => {
    const inscritasDe = (cicloId) => (inscripciones.find((i) => i.id === idInscripcion(cicloId, grupoDe.get(id)))?.materias ?? []).map((m) => m.materia);
    return armarKardex(id, registros, evaluaciones, ciclos, materias, inscritasDe);
  }).filter((k) => k.totalMaterias > 0);
}
