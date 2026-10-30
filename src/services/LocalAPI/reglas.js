import { ApiError } from '../ApiError.js';

const USUARIO = { id: 'usuario-local', nombre: 'Administrador local', rol: 'administrador' };

const RE_GMAIL = /^(?=[a-z0-9.]{6,30}@)[a-z0-9]+(\.[a-z0-9]+)*@gmail\.com$/;
const RE_TELEFONO = /^\d{10}$/;

const CAMPOS_PERSONA = {
  nombre: { etiqueta: 'Nombre(s)', requerido: true, max: 100, capitalizar: true },
  primerApellido: { etiqueta: 'Apellido paterno', requerido: true, max: 100, capitalizar: true },
  segundoApellido: { etiqueta: 'Apellido materno', max: 100, capitalizar: true },
  telefono: { etiqueta: 'Teléfono', formato: RE_TELEFONO, mensajeFormato: 'El teléfono debe tener 10 dígitos.' },
  correo: { etiqueta: 'Correo', requerido: true, minusculas: true, max: 150, formato: RE_GMAIL, mensajeFormato: 'El correo debe ser una cuenta @gmail.com válida (6 a 30 letras, números o puntos antes del @).' },
};

const ESPECIFICACIONES = {
  plantel: {
    institucion: { etiqueta: 'Nombre de la institución', requerido: true, max: 150, colapsar: true },
    nombre: { etiqueta: 'Nombre del plantel', requerido: true, max: 150, colapsar: true },
    municipio: { etiqueta: 'Municipio', requerido: true, max: 100 },
    telefono: { etiqueta: 'Teléfono', formato: RE_TELEFONO, mensajeFormato: 'El teléfono debe tener 10 dígitos.' },
    domicilio: { etiqueta: 'Domicilio', max: 250 },
  },
  grupo: {
    nombre: { etiqueta: 'Nombre del grupo', requerido: true, max: 100, colapsar: true, mayusculas: true },
    programaEducativo: { etiqueta: 'Programa educativo', requerido: true, catalogo: 'programasEducativos' },
    modalidad: { etiqueta: 'Modalidad', requerido: true, catalogo: 'modalidades' },
    activo: { etiqueta: 'Activo', tipo: 'booleano', omision: true },
  },
  reporte: {
    tipo: { etiqueta: 'Tipo de reporte', requerido: true, catalogo: 'tiposReporte' },
    descripcion: { etiqueta: 'Descripción', requerido: true, max: 2000 },
    acciones: { etiqueta: 'Acciones tomadas', max: 1000 },
  },
  personal: {
    ...CAMPOS_PERSONA,
    genero: { etiqueta: 'Género', requerido: true, catalogo: 'generos' },
    roles: { etiqueta: 'Roles', requerido: true, catalogo: 'roles', tipo: 'lista' },
    grupos: { etiqueta: 'Grupos', catalogo: 'grupos', tipo: 'lista' },
    activo: { etiqueta: 'Activo', tipo: 'booleano', omision: true },
  },
  estudiante: {
    ...CAMPOS_PERSONA,
    genero: { etiqueta: 'Género', requerido: true, catalogo: 'generos' },
    grupo: { etiqueta: 'Grupo', requerido: true, catalogo: 'grupos' },
    tiempo: { etiqueta: 'Tiempo', requerido: true, catalogo: 'tiempos' },
    activo: { etiqueta: 'Activo', tipo: 'booleano', omision: true },
  },
};

function capitalizarPalabras(texto) {
  return texto
    .toLocaleLowerCase('es-MX')
    .replace(/(^|[\s-])(\p{L})/gu, (_, separador, letra) => separador + letra.toLocaleUpperCase('es-MX'));
}

function falla(mensaje) {
  return new ApiError('VALIDACION', mensaje);
}

export function usuarioActual() {
  return USUARIO;
}

export function exigirEscritura() {
  if (USUARIO.rol !== 'administrador') {
    throw new ApiError('NO_AUTORIZADO', 'No tienes permiso para modificar registros.');
  }
}

function validarLista(def, valor, catalogos) {
  const lista = valor ?? [];
  if (!Array.isArray(lista) || lista.some((v) => typeof v !== 'string')) throw falla(`El campo «${def.etiqueta}» debe ser una lista.`);
  const unicos = [...new Set(lista)];
  if (def.requerido && unicos.length === 0) throw falla(`Elige al menos un valor en «${def.etiqueta}».`);
  if (unicos.some((id) => !(catalogos[def.catalogo] || []).some((e) => e.id === id))) {
    throw falla(`Algún valor de «${def.etiqueta}» no existe en el catálogo.`);
  }
  return (catalogos[def.catalogo] || []).map((e) => e.id).filter((id) => unicos.includes(id));
}

export function validarRolesAsignables(roles, catalogos) {
  const externo = (catalogos.roles || []).find((r) => roles.includes(r.id) && r.asignacion === 'entra-id');
  if (externo) throw falla(`El rol «${externo.nombre}» no se asigna en el registro: lo otorga Microsoft Entra ID al iniciar sesión.`);
}

export function validarRolesDisponibles(roles, otros, catalogos) {
  (catalogos.roles || []).forEach((rol) => {
    if (!rol.maximo || !roles.includes(rol.id)) return;
    const titulares = otros.filter((p) => (p.roles || []).includes(rol.id));
    if (titulares.length >= rol.maximo) {
      const nombres = titulares.map((p) => [p.nombre, p.primerApellido, p.segundoApellido].filter(Boolean).join(' ')).join(', ');
      throw new ApiError('ROL_OCUPADO', `El rol «${rol.nombre}» ya está asignado a ${nombres}.`);
    }
  });
}

const ROL_CON_GRUPOS = 'docente';

export function gruposSegunRol(limpio) {
  return limpio.roles.includes(ROL_CON_GRUPOS) ? limpio : { ...limpio, grupos: [] };
}

const claveNombre = (texto) => texto.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es-MX');

export function validarNombreGrupoUnico(nombre, otros) {
  if (otros.some((g) => claveNombre(g.nombre) === claveNombre(nombre))) {
    throw falla(`Ya existe un grupo llamado «${nombre}».`);
  }
}

export function ordenarGrupos(grupos) {
  return [...grupos].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base', numeric: true }));
}

export function prepararRegistro(tipo, datos, catalogos) {
  if (!datos || typeof datos !== 'object') throw falla('Faltan los datos del registro.');
  const limpio = {};
  Object.entries(ESPECIFICACIONES[tipo]).forEach(([campo, def]) => {
    let valor = datos[campo];
    if (def.tipo === 'booleano') {
      if (valor === undefined || valor === null) valor = def.omision;
      if (typeof valor !== 'boolean') throw falla(`El campo «${def.etiqueta}» debe ser verdadero o falso.`);
      limpio[campo] = valor;
      return;
    }
    if (def.tipo === 'lista') {
      limpio[campo] = validarLista(def, valor, catalogos);
      return;
    }
    if (valor === undefined || valor === null) valor = '';
    if (typeof valor !== 'string') throw falla(`El campo «${def.etiqueta}» debe ser texto.`);
    valor = valor.trim();
    if (def.mayusculas) valor = valor.toUpperCase();
    if (def.minusculas) valor = valor.toLowerCase();
    if (def.capitalizar) valor = capitalizarPalabras(valor.replace(/\s+/g, ' '));
    else if (def.colapsar) valor = valor.replace(/\s+/g, ' ');
    if (!valor) {
      if (def.requerido) throw falla(`El campo «${def.etiqueta}» es obligatorio.`);
      limpio[campo] = '';
      return;
    }
    if (def.max && valor.length > def.max) throw falla(`El campo «${def.etiqueta}» admite máximo ${def.max} caracteres.`);
    if (def.formato && !def.formato.test(valor)) throw falla(def.mensajeFormato);
    if (def.catalogo && !(catalogos[def.catalogo] || []).some((e) => e.id === valor)) {
      throw falla(`El valor de «${def.etiqueta}» no existe en el catálogo.`);
    }
    limpio[campo] = valor;
  });
  return limpio;
}

export function exigirVersion(registro, version) {
  if (registro.version !== version) {
    throw new ApiError('CONFLICTO', 'El registro cambió mientras lo editabas. Se recargó la lista; revisa los datos e intenta de nuevo.');
  }
}

export function exigirPlantel(plantel) {
  if (!plantel) {
    throw new ApiError('PLANTEL_NO_CONFIGURADO', 'Primero configura los datos del plantel en el Panel de control.');
  }
}

function soloLetras(texto = '') {
  return texto
    .replace(/ñ/gi, 'X')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

function prefijoMatricula({ nombre, primerApellido, segundoApellido }) {
  const paterno = soloLetras(primerApellido);
  const materno = soloLetras(segundoApellido);
  const primerNombre = soloLetras(nombre.split(' ')[0]);
  return `${paterno}XX`.slice(0, 2) + (materno[0] ?? 'X') + (primerNombre[0] ?? 'X');
}

export function generarMatricula(datos, existentes) {
  const prefijo = prefijoMatricula(datos);
  for (let intento = 0; intento < 50; intento += 1) {
    const digitos = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');
    const matricula = prefijo + digitos;
    if (!existentes.has(matricula)) return matricula;
  }
  throw new ApiError('NO_DISPONIBLE', 'No se pudo generar una matrícula única. Intenta de nuevo.');
}

const CICLOS_POR_ANIO = 6;
const MESES_POR_CICLO = 2;

export function ciclosDelAnio(anio) {
  if (!Number.isInteger(anio) || anio < 2000 || anio > 2100) throw falla('El año debe ser un número entero entre 2000 y 2100.');
  return Array.from({ length: CICLOS_POR_ANIO }, (_, i) => ({
    id: `${anio}-${i + 1}`, anio, numero: i + 1, duracionMeses: MESES_POR_CICLO,
  }));
}

const DIA_MS = 86400000;
const RE_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function aTiempo(iso) {
  if (typeof iso !== 'string' || !RE_FECHA.test(iso)) return null;
  const [a, m, d] = iso.split('-').map(Number);
  const t = Date.UTC(a, m - 1, d);
  const f = new Date(t);
  return f.getUTCFullYear() === a && f.getUTCMonth() === m - 1 && f.getUTCDate() === d ? t : null;
}

function aIso(t) {
  return new Date(t).toISOString().slice(0, 10);
}

export function hoyServidor() {
  const h = new Date();
  return aIso(Date.UTC(h.getFullYear(), h.getMonth(), h.getDate()));
}

function exigirFecha(iso, etiqueta) {
  const t = aTiempo(iso);
  if (t === null) throw falla(`${etiqueta} no es una fecha válida (AAAA-MM-DD).`);
  return t;
}

export function calendarioCiclo(ciclo, semanasCatalogo) {
  if (!ciclo.fechaInicio) return { semanas: [], periodosVacacionales: [], fechaFin: null };
  const pendientes = [...(ciclo.vacaciones || [])].sort((a, b) => a.inicio.localeCompare(b.inicio));
  const catalogo = [...semanasCatalogo].sort((a, b) => a.numero - b.numero);
  const semanas = [];
  const periodosVacacionales = [];
  let cursor = aTiempo(ciclo.fechaInicio);
  catalogo.forEach((semana) => {
    while (pendientes.length > 0 && aTiempo(pendientes[0].inicio) === cursor) {
      const v = pendientes.shift();
      const fin = cursor + (v.semanas * 7 - 1) * DIA_MS;
      periodosVacacionales.push({ inicio: v.inicio, fin: aIso(fin), semanas: v.semanas });
      cursor = fin + DIA_MS;
    }
    semanas.push({ numero: semana.numero, nombre: semana.nombre, inicio: aIso(cursor), fin: aIso(cursor + 6 * DIA_MS) });
    cursor += 7 * DIA_MS;
  });
  if (pendientes.length > 0) {
    throw falla(`El periodo vacacional del ${pendientes[0].inicio} debe empezar al inicio de una semana del ciclo, antes del cierre.`);
  }
  return { semanas, periodosVacacionales, fechaFin: semanas.length ? semanas[semanas.length - 1].fin : null };
}

export function prepararConfiguracionCiclo(datos, semanasCatalogo) {
  if (!datos || typeof datos !== 'object') throw falla('Faltan los datos del ciclo.');
  const inicio = exigirFecha(datos.fechaInicio, 'La fecha de inicio');
  const dia = datos.diaInicioSemana;
  if (!Number.isInteger(dia) || dia < 0 || dia > 6) throw falla('El día de inicio de semana debe ser un entero de 0 (domingo) a 6 (sábado).');
  if (new Date(inicio).getUTCDay() !== dia) throw falla('La fecha de inicio debe caer en el día en que empieza la semana.');
  const listaVacaciones = datos.vacaciones ?? [];
  if (!Array.isArray(listaVacaciones)) throw falla('Las vacaciones deben ser una lista.');
  const vacaciones = listaVacaciones.map((v) => {
    const t = exigirFecha(v?.inicio, 'El inicio de un periodo vacacional');
    if (!Number.isInteger(v.semanas) || v.semanas < 1 || v.semanas > 52) throw falla('Cada periodo vacacional debe durar de 1 a 52 semanas completas.');
    if (t <= inicio) throw falla('Los periodos vacacionales deben empezar después de la Semana 1.');
    return { inicio: aIso(t), semanas: v.semanas };
  }).sort((a, b) => a.inicio.localeCompare(b.inicio));
  if (new Set(vacaciones.map((v) => v.inicio)).size !== vacaciones.length) throw falla('Hay periodos vacacionales repetidos.');
  const limpio = { fechaInicio: aIso(inicio), diaInicioSemana: dia, vacaciones, asuetos: [] };
  const { fechaFin, periodosVacacionales } = calendarioCiclo(limpio, semanasCatalogo);
  const listaAsuetos = datos.asuetos ?? [];
  if (!Array.isArray(listaAsuetos)) throw falla('Los asuetos deben ser una lista.');
  const asuetos = [...new Set(listaAsuetos.map((a) => aIso(exigirFecha(a, 'Un día de asueto'))))].sort();
  asuetos.forEach((a) => {
    if (a < limpio.fechaInicio || a > fechaFin) throw falla(`El asueto del ${a} está fuera del ciclo (${limpio.fechaInicio} a ${fechaFin}).`);
    if (periodosVacacionales.some((v) => a >= v.inicio && a <= v.fin)) throw falla(`El asueto del ${a} cae en un periodo vacacional.`);
  });
  return { ...limpio, asuetos, fechaFin };
}

export function validarCicloSinEncimar(id, inicio, fin, otros) {
  const encimado = otros.find((c) => c.id !== id && c.fechaInicio && c.fechaFin && inicio <= c.fechaFin && fin >= c.fechaInicio);
  if (encimado) throw falla(`Las fechas se enciman con el ciclo ${encimado.id} (${encimado.fechaInicio} a ${encimado.fechaFin}).`);
}

export function validarFechaReporte(fecha, hoy) {
  const t = exigirFecha(fecha, 'La fecha del reporte');
  const iso = aIso(t);
  if (iso > hoy) throw falla('La fecha del reporte no puede ser posterior a hoy.');
  return iso;
}

export function cicloDeFecha(fecha, ciclos) {
  return ciclos.find((c) => c.fechaInicio && c.fechaFin && fecha >= c.fechaInicio && fecha <= c.fechaFin)?.id ?? null;
}

export function ordenarReportes(reportes) {
  return [...reportes].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.creadoEn.localeCompare(a.creadoEn));
}

export function exigirCiclosAnterioresCerrados(ciclo, todos) {
  if (ciclo.cerrado) throw falla(`El ciclo ${ciclo.id} ya se concluyó y no se puede modificar.`);
  const abierto = todos.find((c) => c.id !== ciclo.id && c.fechaInicio && !c.cerrado
    && (c.anio < ciclo.anio || (c.anio === ciclo.anio && c.numero < ciclo.numero)));
  if (abierto) throw falla(`Primero concluye el ciclo ${abierto.id} para poder configurar el ${ciclo.id}.`);
}

export function cicloConDerivados(guardado, semanasCatalogo, hoy) {
  const ciclo = {
    ...guardado,
    fechaInicio: guardado.fechaInicio ?? null,
    diaInicioSemana: guardado.diaInicioSemana ?? null,
    vacaciones: guardado.vacaciones ?? [],
    asuetos: guardado.asuetos ?? [],
    version: guardado.version ?? 1,
    cerrado: guardado.cerrado ?? false,
  };
  const { semanas, periodosVacacionales, fechaFin } = calendarioCiclo(ciclo, semanasCatalogo);
  let estado = 'sin-configurar';
  let semanaActual = null;
  if (fechaFin) {
    if (hoy < ciclo.fechaInicio) estado = 'proximo';
    else if (hoy > fechaFin) estado = 'concluido';
    else {
      estado = 'en-curso';
      const semana = semanas.find((s) => hoy >= s.inicio && hoy <= s.fin);
      semanaActual = semana ? { numero: semana.numero, nombre: semana.nombre } : { numero: null, nombre: 'Vacaciones' };
    }
  }
  return { ...ciclo, semanas, periodosVacacionales, fechaFin, estado, semanaActual, asuetoHoy: ciclo.asuetos.includes(hoy) };
}

export function ordenarCiclos(ciclos) {
  return [...ciclos].sort((a, b) => a.anio - b.anio || a.numero - b.numero);
}

const CALIFICACION_MINIMA = 5;
const CALIFICACION_MAXIMA = 10;
const MAX_OBSERVACIONES = 1000;

export function prepararEvaluacion(datos, programaEducativo, catalogos) {
  if (!datos || typeof datos !== 'object') throw falla('Faltan los datos de la evaluación.');
  const { calificaciones, observaciones = '' } = datos;
  if (!Array.isArray(calificaciones) || calificaciones.length === 0) throw falla('Asigna al menos una materia con su calificación.');
  const delPrograma = (catalogos.materias || []).filter((m) => m.programaEducativo === programaEducativo);
  const porMateria = new Map();
  calificaciones.forEach((c) => {
    if (!c || typeof c.materia !== 'string') throw falla('Cada calificación debe indicar su materia.');
    if (!delPrograma.some((m) => m.id === c.materia)) throw falla('Alguna materia no pertenece al programa educativo del estudiante.');
    if (porMateria.has(c.materia)) throw falla('Hay materias repetidas.');
    if (!Number.isInteger(c.calificacion) || c.calificacion < CALIFICACION_MINIMA || c.calificacion > CALIFICACION_MAXIMA) {
      throw falla(`Las calificaciones deben ser enteros del ${CALIFICACION_MINIMA} al ${CALIFICACION_MAXIMA}.`);
    }
    porMateria.set(c.materia, c.calificacion);
  });
  if (typeof observaciones !== 'string') throw falla('Las observaciones deben ser texto.');
  const texto = observaciones.trim();
  if (texto.length > MAX_OBSERVACIONES) throw falla(`Las observaciones admiten máximo ${MAX_OBSERVACIONES} caracteres.`);
  return {
    calificaciones: delPrograma.filter((m) => porMateria.has(m.id)).map((m) => ({ materia: m.id, calificacion: porMateria.get(m.id) })),
    observaciones: texto,
  };
}

export function idEvaluacion(cicloId, estudianteId) {
  return `${cicloId}:${estudianteId}`;
}

export function conPromedio(evaluacion) {
  const suma = evaluacion.calificaciones.reduce((total, c) => total + c.calificacion, 0);
  return { ...evaluacion, promedio: suma / evaluacion.calificaciones.length };
}

const comparar = (a = '', b = '') => a.localeCompare(b, 'es', { sensitivity: 'base' });

export function ordenarPersonas(registros) {
  return [...registros].sort((a, b) => comparar(a.primerApellido, b.primerApellido)
    || comparar(a.segundoApellido, b.segundoApellido)
    || comparar(a.nombre, b.nombre));
}
