import { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as api from '../services/api.js';
import { guardarCache, obtenerCache, guardarBorrador, obtenerBorrador, eliminarBorrador } from '../services/SesionIndexedDB.js';

const RECURSOS = {
  catalogos: { listar: api.listarCatalogos },
  plantel: { listar: api.obtenerPlantel },
  grupos: { listar: api.listarGrupos, crear: api.crearGrupo, editar: api.editarGrupo, eliminar: api.eliminarGrupo },
  personal: { listar: api.listarPersonal, crear: api.crearPersonal, editar: api.editarPersonal, eliminar: api.eliminarPersonal },
  estudiantes: { listar: api.listarEstudiantes, crear: api.crearEstudiante, editar: api.editarEstudiante, eliminar: api.eliminarEstudiante },
  ciclos: { listar: api.listarCiclos },
  evaluaciones: { listar: api.listarEvaluaciones },
  reportes: { listar: api.listarReportes, crear: api.crearReporte },
  inscripciones: { listar: api.listarInscripciones },
  calificacionesKardex: { listar: api.listarCalificacionesKardex, crear: api.crearCalificacionKardex, editar: api.editarCalificacionKardex, eliminar: api.eliminarCalificacionKardex },
  kardex: { listar: api.listarKardex },
  cursos: { listar: api.listarCursos, crear: api.crearCurso, editar: api.editarCurso, eliminar: api.eliminarCurso },
  menciones: { listar: api.listarMenciones, crear: api.otorgarMencion, eliminar: api.revocarMencion },
};
const AFECTAN_CICLOS = ['grupos', 'personal'];
const CLAVES = Object.keys(RECURSOS);
const VACIOS = { catalogos: {}, plantel: null, grupos: [], personal: [], estudiantes: [], ciclos: [], evaluaciones: [], reportes: [], inscripciones: [], calificacionesKardex: [], kardex: [], cursos: [], menciones: [] };

const RegistrosContext = createContext(null);

function conSincronizacion(recurso, valor) {
  if (recurso === 'catalogos' || !valor) return valor;
  if (recurso === 'plantel') return { ...valor, sincronizacion: 'servidor' };
  return valor.map((r) => ({ ...r, sincronizacion: 'servidor' }));
}

function errorVisible(e) {
  return { codigo: e?.codigo ?? 'DESCONOCIDO', mensaje: e?.mensaje ?? 'Ocurrió un error inesperado.' };
}

export function RegistrosProvider({ children }) {
  const [datos, setDatos] = useState(VACIOS);
  const [carga, setCarga] = useState(() => Object.fromEntries(CLAVES.map((c) => [c, { cargando: true, error: null }])));
  const datosRef = useRef(VACIOS);
  const [cicloElegidoId, setCicloElegidoId] = useState(null);
  const [cambios, setCambios] = useState(0);

  function fijar(recurso, valor) {
    datosRef.current = { ...datosRef.current, [recurso]: valor };
    setDatos(datosRef.current);
    setCambios((n) => n + 1);
  }

  function fijarCarga(recurso, estado) {
    setCarga((c) => ({ ...c, [recurso]: estado }));
  }

  async function recargar(recurso) {
    fijarCarga(recurso, { cargando: true, error: null });
    try {
      const valor = conSincronizacion(recurso, await RECURSOS[recurso].listar());
      fijar(recurso, valor);
      fijarCarga(recurso, { cargando: false, error: null });
      guardarCache(recurso, valor).catch(() => {});
    } catch (e) {
      fijarCarga(recurso, { cargando: false, error: errorVisible(e) });
    }
  }

  useEffect(() => {
    CLAVES.forEach(async (recurso) => {
      const enCache = await obtenerCache(recurso).catch(() => null);
      if (enCache) fijar(recurso, enCache);
      recargar(recurso);
    });
  }, []);

  function recargarCiclosSi(recurso) {
    if (AFECTAN_CICLOS.includes(recurso)) recargar('ciclos');
    if (recurso === 'calificacionesKardex') { recargar('kardex'); recargar('evaluaciones'); }
    if (['calificacionesKardex', 'estudiantes'].includes(recurso)) recargar('cursos');
    if (recurso === 'cursos') { recargar('kardex'); recargar('evaluaciones'); }
  }

  async function recargarTodo() {
    setCicloElegidoId(null);
    await Promise.all(CLAVES.map((recurso) => recargar(recurso)));
  }

  async function crear(recurso, valores) {
    const registro = await RECURSOS[recurso].crear(valores);
    await recargar(recurso);
    recargarCiclosSi(recurso);
    return registro;
  }

  async function editar(recurso, id, cambios) {
    const actual = datosRef.current[recurso].find((r) => r.id === id);
    try {
      const registro = await RECURSOS[recurso].editar(id, actual?.version, cambios);
      await recargar(recurso);
      recargarCiclosSi(recurso);
      return registro;
    } catch (e) {
      if (e?.codigo === 'CONFLICTO' || e?.codigo === 'NO_ENCONTRADO') recargar(recurso);
      throw e;
    }
  }

  async function guardarPlantel(valores) {
    try {
      const plantel = conSincronizacion('plantel', await api.guardarPlantel(datosRef.current.plantel?.version ?? null, valores));
      fijar('plantel', plantel);
      guardarCache('plantel', plantel).catch(() => {});
      return plantel;
    } catch (e) {
      if (e?.codigo === 'CONFLICTO') recargar('plantel');
      throw e;
    }
  }

  async function crearMateria(datos) {
    const materia = await api.crearMateria(datos);
    await recargar('catalogos');
    return materia;
  }

  async function crearCiclosAnuales(anio) {
    const ciclos = conSincronizacion('ciclos', await api.crearCiclosAnuales(anio));
    fijar('ciclos', ciclos);
    guardarCache('ciclos', ciclos).catch(() => {});
    return ciclos;
  }

  async function configurarCiclo(id, valores) {
    return actualizarCiclo(id, (version) => api.configurarCiclo(id, version, valores));
  }

  async function concluirCiclo(id) {
    return actualizarCiclo(id, (version) => api.concluirCiclo(id, version));
  }

  async function iniciarCiclo(id) {
    const ciclo = await actualizarCiclo(id, (version) => api.iniciarCiclo(id, version));
    recargar('kardex');
    recargar('cursos');
    return ciclo;
  }

  async function guardarInscripcion(cicloId, grupoId, valores) {
    const actual = datosRef.current.inscripciones.find((i) => i.cicloId === cicloId && i.grupoId === grupoId && !i.personalizada);
    try {
      const [inscripcion] = conSincronizacion('inscripciones', [await api.guardarInscripcion(cicloId, grupoId, actual?.version ?? null, valores)]);
      const valor = [...datosRef.current.inscripciones.filter((i) => i.id !== inscripcion.id), inscripcion];
      fijar('inscripciones', valor);
      guardarCache('inscripciones', valor).catch(() => {});
      await recargar('ciclos');
      return inscripcion;
    } catch (e) {
      if (e?.codigo === 'CONFLICTO' || e?.codigo === 'NO_ENCONTRADO') recargar('inscripciones');
      throw e;
    }
  }

  async function recargarTrasPersonalizado() {
    await recargar('inscripciones');
    recargar('ciclos');
    recargar('evaluaciones');
    recargar('kardex');
    recargar('cursos');
  }

  async function guardarHorarioPersonalizado(cicloId, grupoId, id, valores) {
    const actual = id ? datosRef.current.inscripciones.find((i) => i.id === id) : null;
    try {
      const registro = await api.guardarHorarioPersonalizado(cicloId, grupoId, id, actual?.version ?? null, valores);
      await recargarTrasPersonalizado();
      return registro;
    } catch (e) {
      if (e?.codigo === 'CONFLICTO' || e?.codigo === 'NO_ENCONTRADO') recargar('inscripciones');
      throw e;
    }
  }

  async function eliminarHorarioPersonalizado(id) {
    await api.eliminarHorarioPersonalizado(id);
    await recargarTrasPersonalizado();
  }

  async function actualizarCiclo(id, operacion) {
    const actual = datosRef.current.ciclos.find((c) => c.id === id);
    try {
      const [ciclo] = conSincronizacion('ciclos', [await operacion(actual?.version ?? 1)]);
      const valor = datosRef.current.ciclos.map((c) => (c.id === ciclo.id ? ciclo : c));
      fijar('ciclos', valor);
      guardarCache('ciclos', valor).catch(() => {});
      return ciclo;
    } catch (e) {
      if (e?.codigo === 'CONFLICTO') recargar('ciclos');
      throw e;
    }
  }

  async function guardarEvaluacion(estudianteId, cicloId, valores) {
    const actual = datosRef.current.evaluaciones.find((e) => e.estudianteId === estudianteId && e.cicloId === cicloId);
    try {
      const [evaluacion] = conSincronizacion('evaluaciones', [await api.guardarEvaluacion(estudianteId, cicloId, actual?.version ?? null, valores)]);
      const valor = [...datosRef.current.evaluaciones.filter((e) => e.id !== evaluacion.id), evaluacion];
      fijar('evaluaciones', valor);
      guardarCache('evaluaciones', valor).catch(() => {});
      recargar('kardex');
      recargar('cursos');
      return evaluacion;
    } catch (e) {
      if (e?.codigo === 'CONFLICTO' || e?.codigo === 'NO_ENCONTRADO') recargar('evaluaciones');
      throw e;
    }
  }

  async function operarCurso(id, operacion) {
    const actual = datosRef.current.cursos.find((c) => c.id === id);
    try {
      const [curso] = conSincronizacion('cursos', [await operacion(actual?.version)]);
      const valor = datosRef.current.cursos.map((c) => (c.id === curso.id ? curso : c));
      fijar('cursos', valor);
      guardarCache('cursos', valor).catch(() => {});
      recargar('kardex');
      recargar('evaluaciones');
      return curso;
    } catch (e) {
      if (e?.codigo === 'CONFLICTO' || e?.codigo === 'NO_ENCONTRADO') recargar('cursos');
      throw e;
    }
  }

  async function eliminar(recurso, id) {
    await RECURSOS[recurso].eliminar(id);
    const valor = datosRef.current[recurso].filter((r) => r.id !== id);
    fijar(recurso, valor);
    guardarCache(recurso, valor).catch(() => {});
    recargarCiclosSi(recurso);
  }

  const errores = CLAVES.map((c) => carga[c].error).filter(Boolean);
  const { catalogos, ciclos } = datos;
  const anioEnCurso = new Date().getFullYear();
  const cicloActivo = ciclos.find((c) => c.id === cicloElegidoId)
    ?? ciclos.find((c) => c.estado === 'en-curso')
    ?? ciclos.find((c) => c.iniciado && !c.cerrado)
    ?? ciclos.find((c) => c.estado === 'proximo')
    ?? [...ciclos].reverse().find((c) => c.estado !== 'sin-configurar' && !c.cerrado)
    ?? ciclos.find((c) => c.anio === anioEnCurso)
    ?? ciclos[0]
    ?? null;

  const value = {
    GENEROS: catalogos.generos || [],
    ROLES: catalogos.roles || [],
    MENCIONES: datos.menciones,
    otorgarMencion: (v) => crear('menciones', v),
    revocarMencion: (id) => eliminar('menciones', id),
    PROGRAMAS_EDUCATIVOS: catalogos.programasEducativos || [],
    TIEMPOS: catalogos.tiempos || [],
    MODALIDADES: catalogos.modalidades || [],
    MATERIAS: catalogos.materias || [],
    HORAS_CLASE: catalogos.horasClase || [],
    TIPOS_REPORTE: catalogos.tiposReporte || [],
    PLANTEL: datos.plantel,
    GRUPOS: datos.grupos,
    PERSONAL: datos.personal,
    ESTUDIANTES: datos.estudiantes,
    CICLOS: ciclos,
    EVALUACIONES: datos.evaluaciones,
    REPORTES: datos.reportes,
    INSCRIPCIONES: datos.inscripciones,
    CALIFICACIONES_KARDEX: datos.calificacionesKardex,
    KARDEX: datos.kardex,
    CURSOS: datos.cursos,
    crearCurso: (v) => crear('cursos', v),
    editarCurso: (id, c) => editar('cursos', id, c),
    eliminarCurso: (id) => eliminar('cursos', id),
    inscribirEnCurso: (id, estudianteId) => operarCurso(id, (v) => api.inscribirEnCurso(id, v, estudianteId)),
    quitarDeCurso: (id, estudianteId) => operarCurso(id, (v) => api.quitarDeCurso(id, v, estudianteId)),
    marcarAcreditado: (id, estudianteId, acreditado) => operarCurso(id, (v) => api.marcarAcreditado(id, v, estudianteId, acreditado)),
    emitirConstancias: (id, destinatarios) => operarCurso(id, () => api.emitirConstancias(id, destinatarios)),
    crearCalificacionKardex: (v) => crear('calificacionesKardex', v),
    editarCalificacionKardex: (id, c) => editar('calificacionesKardex', id, c),
    eliminarCalificacionKardex: (id) => eliminar('calificacionesKardex', id),
    guardarInscripcion,
    guardarHorarioPersonalizado,
    eliminarHorarioPersonalizado,
    iniciarCiclo,
    crearReporte: (v) => crear('reportes', v),
    guardarEvaluacion,
    cicloActivoId: cicloActivo?.id ?? null,
    seleccionarCiclo: setCicloElegidoId,
    crearCiclosAnuales,
    crearMateria,
    configurarCiclo,
    concluirCiclo,
    SEMANAS_CICLO: catalogos.semanasCiclo || [],
    CARGA: carga,
    CAMBIOS: cambios,
    recargarTodo,
    cargando: CLAVES.some((c) => carga[c].cargando),
    error: errores[0] ?? null,
    guardarPlantel,
    crearGrupo: (v) => crear('grupos', v),
    editarGrupo: (id, c) => editar('grupos', id, c),
    eliminarGrupo: (id) => eliminar('grupos', id),
    crearPersonal: (v) => crear('personal', v),
    editarPersonal: (id, c) => editar('personal', id, c),
    eliminarPersonal: (id) => eliminar('personal', id),
    crearEstudiante: (v) => crear('estudiantes', v),
    editarEstudiante: (id, c) => editar('estudiantes', id, c),
    eliminarEstudiante: (id) => eliminar('estudiantes', id),
    guardarBorrador,
    obtenerBorrador,
    eliminarBorrador,
  };

  return <RegistrosContext.Provider value={value}>{children}</RegistrosContext.Provider>;
}

export function useRegistros() {
  return useContext(RegistrosContext);
}
