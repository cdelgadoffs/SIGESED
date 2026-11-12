import { ApiError } from '../ApiError.js';

const USUARIO = { id: 'usuario-local', nombre: 'Usuario local' };
const NIVELES = { ninguno: 0, ver: 1, propio: 2, editar: 3 };

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

let sesion = null;

export function usuarioActual() {
  return sesion ? { id: sesion.usuario, nombre: sesion.nombre } : USUARIO;
}

export function esSuperusuario() {
  return !!sesion && sesion.roles.includes(ROL_ADMINISTRADOR_TI);
}

export function exigirRol(rol, mensaje) {
  if (!sesion) throw new ApiError('NO_AUTORIZADO', 'Inicia sesión para continuar.');
  if (!sesion.roles.includes(rol)) throw new ApiError('PERMISO_DENEGADO', mensaje);
}

function permisosPorRol(roles, rolesCatalogo) {
  return Object.fromEntries(roles.map((rol) => [rol, rolesCatalogo.find((r) => r.id === rol)?.permisos ?? {}]));
}

function nivelEn(porRol, modulo) {
  return Math.max(0, ...Object.values(porRol).map((permisos) => NIVELES[permisos[modulo] ?? permisos['*']] ?? 0));
}

export function fijarSesion(valor) {
  sesion = valor;
}

function leerToken(token) {
  try {
    const parte = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(parte.padEnd(Math.ceil(parte.length / 4) * 4, '=')), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

export function sesionDeTokenEntra(token, { inquilino, cliente }, rolesCatalogo) {
  const datos = typeof token === 'string' ? leerToken(token) : null;
  if (!datos) throw new ApiError('NO_AUTORIZADO', 'El token de Microsoft no es válido.');
  if (datos.tid !== inquilino) throw new ApiError('NO_AUTORIZADO', 'La cuenta no pertenece al directorio de la institución.');
  const audiencias = [cliente, `api://${cliente}`];
  if (!audiencias.includes(datos.aud)) throw new ApiError('NO_AUTORIZADO', 'El token no fue emitido para SIGESED.');
  if (!datos.exp || datos.exp * 1000 < Date.now()) throw new ApiError('NO_AUTORIZADO', 'La sesión de Microsoft expiró. Vuelve a iniciar sesión.');
  const deEntra = new Set(rolesCatalogo.filter((r) => r.asignacion === 'entra-id').map((r) => r.id));
  const roles = (datos.roles ?? []).filter((r) => deEntra.has(r));
  if (roles.length === 0) throw new ApiError('PERMISO_DENEGADO', 'Tu cuenta de Microsoft no tiene el rol Administrador TI en SIGESED.');
  return {
    usuario: datos.oid ?? datos.sub,
    nombre: datos.name ?? '',
    correo: (datos.email ?? datos.preferred_username ?? datos.upn ?? datos.unique_name ?? '').replace(/^[^#]*#/, ''),
    roles,
    permisosPorRol: permisosPorRol(roles, rolesCatalogo),
    proveedor: 'entra-id',
  };
}

const EMISORES_GOOGLE = ['accounts.google.com', 'https://accounts.google.com'];

export function sesionDeTokenGoogle(token, cliente, personal, estudiantes, rolesCatalogo) {
  const datos = typeof token === 'string' ? leerToken(token) : null;
  if (!datos) throw new ApiError('NO_AUTORIZADO', 'La credencial de Google no es válida.');
  if (!EMISORES_GOOGLE.includes(datos.iss)) throw new ApiError('NO_AUTORIZADO', 'La credencial no fue emitida por Google.');
  if (datos.aud !== cliente) throw new ApiError('NO_AUTORIZADO', 'La credencial no fue emitida para SIGESED.');
  if (!datos.exp || datos.exp * 1000 < Date.now()) throw new ApiError('NO_AUTORIZADO', 'La sesión de Google expiró. Vuelve a acceder.');
  if (datos.email_verified !== true) throw new ApiError('NO_AUTORIZADO', 'El correo de tu cuenta de Google no está verificado.');
  const correo = String(datos.email ?? '').toLowerCase();
  const persona = personal.find((p) => (p.correo ?? '').toLowerCase() === correo && p.activo !== false);
  if (persona) {
    return {
      usuario: persona.id,
      nombre: [persona.nombre, persona.primerApellido].filter(Boolean).join(' ') || datos.name || '',
      correo,
      roles: persona.roles ?? [],
      permisosPorRol: permisosPorRol(persona.roles ?? [], rolesCatalogo),
      proveedor: 'google',
    };
  }
  if (estudiantes.some((e) => (e.correo ?? '').toLowerCase() === correo && e.activo !== false)) {
    throw new ApiError('PERMISO_DENEGADO', 'El acceso para estudiantes estará disponible próximamente.');
  }
  throw new ApiError('NO_REGISTRADO', 'Tu cuenta no está registrada en SIGESED.');
}

export function exigirEscritura(modulo) {
  if (alcanceEscritura(modulo) !== 'todo') throw new ApiError('PERMISO_DENEGADO', 'Tu rol no permite modificar este módulo.');
}

export function alcanceEscritura(modulo) {
  if (!sesion) throw new ApiError('NO_AUTORIZADO', 'Inicia sesión para continuar.');
  const nivel = nivelEn(sesion.permisosPorRol ?? {}, modulo);
  if (nivel >= NIVELES.editar) return 'todo';
  if (nivel >= NIVELES.propio) return 'propio';
  throw new ApiError('PERMISO_DENEGADO', 'Tu rol no permite modificar este módulo.');
}

export function calificacionesDelDocente(nuevas, anteriores, propias) {
  if (!nuevas.some((c) => propias.has(c.materia)) && !anteriores.some((c) => propias.has(c.materia))) {
    throw new ApiError('PERMISO_DENEGADO', 'Solo puedes calificar las materias que impartes.');
  }
  return [
    ...nuevas.filter((c) => propias.has(c.materia)),
    ...anteriores.filter((c) => !propias.has(c.materia)),
  ];
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
    iniciado: guardado.iniciado ?? false,
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

export function exigirCicloPreparable(ciclo, todos) {
  if (ciclo.iniciado) throw falla(`El ciclo ${ciclo.id} ya se inició: su configuración quedó fija.`);
  exigirCiclosAnterioresCerrados(ciclo, todos);
}

const ROL_DOCENTE = 'docente';
export const MATERIAS_POR_GRUPO = 3;
const HORAS_POR_MATERIA = 2;
const DIAS_ENTRE_SEMANA = [1, 2, 3, 4, 5];
const DIA_SABADO = 6;

const nombrePersona = (p) => [p.nombre, p.primerApellido, p.segundoApellido].filter(Boolean).join(' ');

function tipoHorario(grupo, catalogos) {
  return (catalogos.modalidades || []).find((m) => m.id === grupo.modalidad)?.horario ?? null;
}

function puedeImpartir(persona) {
  return !!persona && persona.activo !== false && (persona.roles || []).includes(ROL_DOCENTE);
}

function horasDeClase(grupo, catalogos) {
  return (catalogos.horasClase || []).filter((h) => h.modalidad === grupo.modalidad && !h.descanso);
}

function bloqueValido(b, tipo, horas) {
  const dia = tipo === 'sabado' ? b.dia === DIA_SABADO : DIAS_ENTRE_SEMANA.includes(b.dia);
  return dia && horas.some((h) => h.id === b.hora);
}

function conTiempo(b, catalogos) {
  const hora = (catalogos.horasClase || []).find((h) => h.id === b.hora);
  return { ...b, inicio: hora?.inicio ?? '', fin: hora?.fin ?? '' };
}

function seEnciman(a, b) {
  return a.dia === b.dia && a.inicio < b.fin && b.inicio < a.fin;
}

function prepararHorario(horario, tipo, horas, nombreMateria, maxHoras = HORAS_POR_MATERIA) {
  if (tipo === null) return [];
  const lista = horario ?? [];
  if (!Array.isArray(lista)) throw falla(`El horario de «${nombreMateria}» debe ser una lista.`);
  if (lista.length > maxHoras) throw falla(`«${nombreMateria}» admite máximo ${maxHoras} horas de clase.`);
  const vistos = new Set();
  const bloques = lista.map((b) => {
    if (!b || typeof b !== 'object') throw falla(`Hay un bloque inválido en el horario de «${nombreMateria}».`);
    const dia = tipo === 'sabado' ? DIA_SABADO : b.dia;
    if (tipo === 'entre-semana' && !DIAS_ENTRE_SEMANA.includes(dia)) throw falla(`En «${nombreMateria}» el día debe ser de lunes a viernes.`);
    if (!horas.some((h) => h.id === b.hora)) throw falla(`Alguna hora de «${nombreMateria}» no es una hora de clase de la modalidad del grupo.`);
    const clave = `${dia}:${b.hora}`;
    if (vistos.has(clave)) throw falla(`«${nombreMateria}» tiene una hora repetida.`);
    vistos.add(clave);
    return { dia, hora: b.hora };
  });
  const orden = (id) => horas.findIndex((h) => h.id === id);
  return bloques.sort((a, b) => a.dia - b.dia || orden(a.hora) - orden(b.hora));
}

export function prepararInscripcion(datos, grupo, catalogos, personal, libre = false) {
  if (!datos || typeof datos !== 'object' || !Array.isArray(datos.materias)) throw falla('Faltan las materias de la inscripción.');
  if (!libre && datos.materias.length > MATERIAS_POR_GRUPO) throw falla(`Un grupo se inscribe en máximo ${MATERIAS_POR_GRUPO} materias por ciclo.`);
  const delPrograma = (catalogos.materias || []).filter((m) => m.programaEducativo === grupo.programaEducativo);
  const tipo = tipoHorario(grupo, catalogos);
  const horas = horasDeClase(grupo, catalogos);
  const vistas = new Set();
  const materias = datos.materias.map((m) => {
    const materia = delPrograma.find((x) => x.id === m?.materia);
    if (!materia) throw falla('Alguna materia no pertenece al programa educativo del grupo.');
    if (vistas.has(materia.id)) throw falla(`La materia «${materia.nombre}» está repetida.`);
    vistas.add(materia.id);
    const docenteId = m.docenteId || null;
    if (docenteId && !puedeImpartir(personal.find((p) => p.id === docenteId))) {
      throw falla(`El docente de «${materia.nombre}» debe estar activo y tener el rol Docente.`);
    }
    return { materia: materia.id, docenteId, horario: prepararHorario(m.horario, tipo, horas, materia.nombre, libre ? Infinity : HORAS_POR_MATERIA) };
  });
  const nombre = (id) => delPrograma.find((x) => x.id === id).nombre;
  const bloques = materias.flatMap((m) => m.horario.map((b) => ({ ...conTiempo(b, catalogos), materia: m.materia })));
  bloques.forEach((a, i) => bloques.slice(i + 1).forEach((b) => {
    if (seEnciman(a, b)) throw falla(`El grupo tendría «${nombre(a.materia)}» y «${nombre(b.materia)}» a la misma hora.`);
  }));
  return { materias };
}

function mismoHorario(a, b) {
  const clave = (lista) => lista.map((x) => `${x.dia}|${x.hora}`).sort().join(',');
  return a.length > 0 && clave(a) === clave(b);
}

export function validarDocentesSinChoque(materias, otras, grupos, personal, catalogos, grupoId) {
  materias.forEach((m) => {
    if (!m.docenteId) return;
    otras.forEach((ins) => ins.materias.forEach((o) => {
      if (o.docenteId !== m.docenteId) return;
      if (ins.grupoId === grupoId && o.materia === m.materia) return;
      if (o.materia === m.materia && mismoHorario(o.horario, m.horario)) return;
      if (m.horario.some((a) => o.horario.some((b) => seEnciman(conTiempo(a, catalogos), conTiempo(b, catalogos))))) {
        const docente = nombrePersona(personal.find((p) => p.id === m.docenteId));
        const grupo = grupos.find((g) => g.id === ins.grupoId)?.nombre ?? ins.grupoId;
        const materia = (catalogos.materias || []).find((x) => x.id === o.materia)?.nombre ?? o.materia;
        throw falla(`${docente} ya da «${materia}» al grupo ${grupo} a esa hora.`);
      }
    }));
  });
}

export function pendientesDeInicio(ciclo, { grupos, inscripciones, personal, catalogos }, hoy) {
  if (ciclo.iniciado || ciclo.cerrado) return [];
  const pendientes = [];
  const delCiclo = (paso, texto) => pendientes.push({ paso, grupoId: null, mensaje: texto });
  if (!ciclo.fechaInicio) delCiclo('calendario', 'Configura el calendario del ciclo.');
  else if (hoy >= ciclo.fechaInicio) delCiclo('calendario', 'La fecha de inicio ya llegó y el ciclo solo se inicia antes: recorre la fecha de inicio del calendario.');
  const activos = ordenarGrupos(grupos.filter((g) => g.activo !== false));
  if (activos.length === 0) delCiclo('grupos', 'Registra al menos un grupo activo.');
  activos.forEach((g) => {
    const agregar = (texto) => pendientes.push({ paso: 'grupo', grupoId: g.id, mensaje: texto });
    const materias = inscripciones.find((i) => i.id === idInscripcion(ciclo.id, g.id))?.materias ?? [];
    if (materias.length < MATERIAS_POR_GRUPO) agregar(`Inscribe ${MATERIAS_POR_GRUPO} materias (lleva ${materias.length}).`);
    const tipo = tipoHorario(g, catalogos);
    const horas = horasDeClase(g, catalogos);
    materias.forEach((m) => {
      const materia = (catalogos.materias || []).find((x) => x.id === m.materia);
      if (!materia || materia.programaEducativo !== g.programaEducativo) {
        agregar(`«${materia?.nombre ?? m.materia}» no pertenece al programa educativo del grupo.`);
        return;
      }
      if (!m.docenteId) agregar(`Asigna el docente de «${materia.nombre}».`);
      else if (!puedeImpartir(personal.find((p) => p.id === m.docenteId))) agregar(`El docente de «${materia.nombre}» está inactivo o ya no tiene el rol Docente.`);
      if (tipo !== null && m.horario.length === 0) agregar(`«${materia.nombre}» no tiene horas de clase.`);
      else if (tipo !== null && m.horario.some((b) => !bloqueValido(b, tipo, horas))) agregar(`El horario de «${materia.nombre}» no corresponde a la modalidad del grupo.`);
    });
  });
  return pendientes;
}

export function idInscripcion(cicloId, grupoId) {
  return `${cicloId}:${grupoId}`;
}

export function idPersonalizada(cicloId, grupoId) {
  return `${cicloId}:${grupoId}:p:${crypto.randomUUID()}`;
}

export function inscripcionDeEstudiante(inscripciones, cicloId, estudiante) {
  if (!estudiante) return null;
  return inscripciones.find((i) => i.cicloId === cicloId && i.personalizada && (i.estudiantes ?? []).includes(estudiante.id))
    ?? inscripciones.find((i) => i.id === idInscripcion(cicloId, estudiante.grupo))
    ?? null;
}

export function prepararEstudiantesPersonalizada(lista, estudiantes, otras, actuales = []) {
  if (!Array.isArray(lista) || lista.length === 0) throw falla('Elige al menos un alumno que tome el horario personalizado.');
  const ids = [...new Set(lista)];
  ids.forEach((id) => {
    const alumno = estudiantes.find((e) => e.id === id);
    if (!alumno) throw falla('Algún alumno no existe.');
    if (alumno.activo === false && !actuales.includes(id) && !esSuperusuario()) throw falla(`${nombrePersona(alumno)} está inactivo.`);
    const otra = otras.find((i) => (i.estudiantes ?? []).includes(id));
    if (otra) throw falla(`${nombrePersona(alumno)} ya tiene otro horario personalizado en este ciclo.`);
  });
  return ids;
}

export function ordenarCiclos(ciclos) {
  return [...ciclos].sort((a, b) => a.anio - b.anio || a.numero - b.numero);
}

const CALIFICACION_MINIMA = 5;
const CALIFICACION_MAXIMA = 10;
const MAX_OBSERVACIONES = 1000;

export function prepararEvaluacion(datos, permitidas) {
  if (!datos || typeof datos !== 'object') throw falla('Faltan los datos de la evaluación.');
  const { calificaciones, observaciones = '' } = datos;
  if (!Array.isArray(calificaciones) || calificaciones.length === 0) throw falla('Asigna al menos una materia con su calificación.');
  const delPrograma = permitidas;
  const porMateria = new Map();
  calificaciones.forEach((c) => {
    if (!c || typeof c.materia !== 'string') throw falla('Cada calificación debe indicar su materia.');
    if (!delPrograma.some((m) => m.id === c.materia)) throw falla('Alguna materia no está inscrita por el grupo del estudiante en este ciclo.');
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

export function conPromedio(evaluacion, materiasInscritas) {
  const suma = evaluacion.calificaciones.reduce((total, c) => total + c.calificacion, 0);
  const materias = Math.max(materiasInscritas, evaluacion.calificaciones.length);
  return { ...evaluacion, promedio: suma / materias };
}

const comparar = (a = '', b = '') => a.localeCompare(b, 'es', { sensitivity: 'base' });

export function ordenarPersonas(registros) {
  return [...registros].sort((a, b) => comparar(a.primerApellido, b.primerApellido)
    || comparar(a.segundoApellido, b.segundoApellido)
    || comparar(a.nombre, b.nombre));
}

const MAX_OBSERVACIONES_KARDEX = 500;

export function prepararCalificacionKardex(datos, permitidas) {
  if (!datos || typeof datos !== 'object') throw falla('Faltan los datos de la calificación.');
  const { materia, calificacion, observaciones = '' } = datos;
  if (typeof materia !== 'string' || !materia) throw falla('Elige la materia.');
  if (!permitidas.some((m) => m.id === materia)) throw falla('La materia no pertenece al programa educativo del estudiante.');
  if (!Number.isInteger(calificacion) || calificacion < CALIFICACION_MINIMA || calificacion > CALIFICACION_MAXIMA) {
    throw falla(`La calificación debe ser un entero del ${CALIFICACION_MINIMA} al ${CALIFICACION_MAXIMA}.`);
  }
  if (typeof observaciones !== 'string') throw falla('Las observaciones deben ser texto.');
  const texto = observaciones.trim();
  if (texto.length > MAX_OBSERVACIONES_KARDEX) throw falla(`Las observaciones admiten máximo ${MAX_OBSERVACIONES_KARDEX} caracteres.`);
  return { materia, calificacion, observaciones: texto };
}

export const CALIFICACION_APROBATORIA = 7;

export function materiasAcreditadas(estudianteId, registros, evaluaciones, ciclos, { excluirCicloId = null, excluirRegistroId = null, recuperadas = [] } = {}) {
  const iniciados = new Set(ciclos.filter((c) => c.iniciado).map((c) => c.id));
  const acreditadas = new Set(recuperadas);
  registros.filter((r) => r.estudianteId === estudianteId && r.id !== excluirRegistroId && r.calificacion >= CALIFICACION_APROBATORIA)
    .forEach((r) => acreditadas.add(r.materia));
  evaluaciones.filter((e) => e.estudianteId === estudianteId && e.cicloId !== excluirCicloId && iniciados.has(e.cicloId))
    .forEach((e) => e.calificaciones.filter((c) => c.calificacion >= CALIFICACION_APROBATORIA).forEach((c) => acreditadas.add(c.materia)));
  return acreditadas;
}

export function exigirNoAcreditadas(materias, acreditadas, nombreDe) {
  const repetidas = materias.filter((m) => acreditadas.has(m));
  if (repetidas.length) {
    throw new ApiError('MATERIA_ACREDITADA', `El estudiante ya acreditó ${repetidas.map(nombreDe).join(', ')}: no se puede registrar de nuevo.`);
  }
}

export function validarMateriaKardexUnica(registros, estudianteId, materia, nombreMateria, idActual) {
  if (registros.some((r) => r.estudianteId === estudianteId && r.materia === materia && r.id !== idActual)) {
    throw falla(`${nombreMateria} ya tiene calificación en el kárdex de este estudiante: edítala.`);
  }
}

export function armarKardex(estudianteId, registros, evaluaciones, ciclos, materias, inscritasDe, recuperaciones = new Map()) {
  const iniciados = new Set(ciclos.filter((c) => c.iniciado).map((c) => c.id));
  const propias = evaluaciones.filter((e) => e.estudianteId === estudianteId && iniciados.has(e.cicloId))
    .sort((a, b) => a.cicloId.localeCompare(b.cicloId));
  const acreditadas = materiasAcreditadas(estudianteId, registros, evaluaciones, ciclos);
  const filas = [
    ...registros.filter((r) => r.estudianteId === estudianteId).map((r) => ({
      materia: r.materia, calificacion: r.calificacion, observaciones: r.observaciones, origen: 'captura', registroId: r.id, cicloId: null,
    })),
    ...propias.flatMap((e) => {
      const calificadas = e.calificaciones.map((c) => ({
        materia: c.materia, calificacion: c.calificacion, observaciones: '', origen: 'ciclo', registroId: null, cicloId: e.cicloId,
      }));
      const conCalificacion = new Set(e.calificaciones.map((c) => c.materia));
      const np = inscritasDe(e.cicloId).filter((m) => !conCalificacion.has(m) && !acreditadas.has(m)).map((m) => ({
        materia: m, calificacion: null, observaciones: '', origen: 'ciclo', registroId: null, cicloId: e.cicloId,
      }));
      return [...calificadas, ...np];
    }),
  ];
  const porMateria = new Map();
  filas.forEach((f) => {
    const previa = porMateria.get(f.materia);
    if (!previa || f.calificacion !== null || previa.calificacion === null) porMateria.set(f.materia, f);
  });
  recuperaciones.forEach((cursoId, materia) => {
    const fila = porMateria.get(materia);
    if (!fila || (fila.calificacion !== null && fila.calificacion >= CALIFICACION_APROBATORIA)) return;
    porMateria.set(materia, {
      ...fila,
      calificacion: Math.min(CALIFICACION_MAXIMA, (fila.calificacion ?? CALIFICACION_MINIMA) + PUNTOS_RECUPERACION),
      observaciones: OBSERVACION_RECUPERADA,
      recuperadaEn: cursoId,
    });
  });
  const orden = new Map(materias.map((m, i) => [m.id, i]));
  const cuatrimestreDe = new Map(materias.map((m) => [m.id, m.cuatrimestre]));
  const grupos = new Map();
  [...porMateria.values()].filter((f) => orden.has(f.materia)).forEach((f) => {
    const n = cuatrimestreDe.get(f.materia);
    if (!grupos.has(n)) grupos.set(n, []);
    grupos.get(n).push(f);
  });
  const promedio = (lista) => (lista.length ? lista.reduce((t, f) => t + (f.calificacion ?? 0), 0) / lista.length : null);
  const cuatrimestres = [...grupos.entries()].sort((a, b) => a[0] - b[0]).map(([numero, lista]) => {
    const ordenadas = [...lista].sort((a, b) => orden.get(a.materia) - orden.get(b.materia));
    return { numero, materias: ordenadas, promedio: promedio(ordenadas) };
  });
  const todas = cuatrimestres.flatMap((c) => c.materias);
  return { estudianteId, cuatrimestres, promedioGeneral: promedio(todas), totalMaterias: todas.length };
}

export const CUATRIMESTRES_PROGRAMA = 9;

export function prepararMateriaManual(datos, programas, materias) {
  if (!datos || typeof datos !== 'object') throw falla('Faltan los datos de la materia.');
  const programa = programas.find((p) => p.id === datos.programaEducativo);
  if (!programa) throw falla('El programa educativo no existe.');
  const nombre = typeof datos.nombre === 'string' ? datos.nombre.trim().replace(/\s+/g, ' ') : '';
  if (!nombre) throw falla('Escribe el nombre de la materia.');
  if (nombre.length > 120) throw falla('El nombre de la materia admite máximo 120 caracteres.');
  const { cuatrimestre } = datos;
  if (!Number.isInteger(cuatrimestre) || cuatrimestre < 1 || cuatrimestre > CUATRIMESTRES_PROGRAMA) {
    throw falla(`El cuatrimestre debe ser del 1 al ${CUATRIMESTRES_PROGRAMA}.`);
  }
  const delPrograma = materias.filter((m) => m.programaEducativo === programa.id);
  const sinAcentos = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  if (delPrograma.some((m) => sinAcentos(m.nombre) === sinAcentos(nombre))) throw falla(`${programa.nombre} ya tiene la materia «${nombre}».`);
  const prefijo = sinAcentos(programa.nombre).replace(/[^a-z]/g, '').slice(0, 3).toUpperCase();
  const claves = new Set(materias.map((m) => m.clave));
  let consecutivo = delPrograma.filter((m) => m.cuatrimestre === cuatrimestre).length + 1;
  let clave = `${prefijo}${cuatrimestre}${String(consecutivo).padStart(2, '0')}`;
  while (claves.has(clave)) {
    consecutivo += 1;
    clave = `${prefijo}${cuatrimestre}${String(consecutivo).padStart(2, '0')}`;
  }
  return {
    id: clave.toLowerCase(), clave, nombre, programaEducativo: programa.id, cuatrimestre, manual: true,
    objetivo: '', temas: [], actividadesDocente: [], actividadesIndependiente: [], evaluacion: [],
  };
}

const PUNTOS_RECUPERACION = 2;
const OBSERVACION_RECUPERADA = 'RECUPERADA';
export const HORAS_CURSO = 3;
const SEMANA_CURSO = 8;
const RE_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export function filaReprobada(kardex, materia) {
  const fila = kardex?.cuatrimestres.flatMap((c) => c.materias).find((m) => m.materia === materia);
  return !!fila && (fila.calificacion === null || fila.calificacion < CALIFICACION_APROBATORIA);
}

export function recuperacionesDe(estudianteId, cursos) {
  const mapa = new Map();
  cursos.filter((c) => c.materia && c.acreditados.includes(estudianteId) && !c.voluntarios.includes(estudianteId))
    .forEach((c) => mapa.set(c.materia, c.id));
  return mapa;
}

export function cicloParaCurso(ciclos) {
  const iniciados = ciclos.filter((c) => c.iniciado && !c.cerrado);
  const ciclo = iniciados.find((c) => c.estado === 'en-curso')
    ?? [...iniciados].sort((a, b) => (a.fechaInicio ?? '').localeCompare(b.fechaInicio ?? ''))[0];
  if (!ciclo) throw falla('No hay un ciclo escolar iniciado: los cursos extracurriculares pertenecen al ciclo iniciado.');
  return ciclo;
}

export function exigirCursoModificable(ciclo) {
  if (ciclo?.cerrado) throw falla('El ciclo escolar del curso ya se concluyó: el curso no se puede modificar.');
}

export function fechaDeCurso(fecha, ciclos) {
  const iso = aIso(exigirFecha(fecha, 'La fecha del curso'));
  return { fecha: iso, cicloId: cicloDeFecha(iso, ciclos) };
}

const PREFIJO_FOLIO = 'CE';

export function folioSiguiente(curso, cursos) {
  const base = `${PREFIJO_FOLIO}-${curso.cicloId ?? `SC-${(curso.fecha ?? new Date().toISOString()).slice(0, 4)}`}-`;
  const usados = cursos.flatMap((c) => Object.values(c.folios ?? {}))
    .map((f) => f.folio)
    .filter((f) => f.startsWith(base))
    .map((f) => Number(f.slice(base.length)) || 0);
  return `${base}${String(Math.max(0, ...usados) + 1).padStart(4, '0')}`;
}

export function prepararCurso(datos, { materias, personal, otros, cicloId }) {
  if (!datos || typeof datos !== 'object') throw falla('Faltan los datos del curso.');
  const nombre = typeof datos.nombre === 'string' ? datos.nombre.trim().replace(/\s+/g, ' ') : '';
  if (!nombre) throw falla('Escribe el nombre del curso.');
  if (nombre.length > 120) throw falla('El nombre del curso admite máximo 120 caracteres.');
  if (otros.some((c) => c.cicloId === cicloId && claveNombre(c.nombre) === claveNombre(nombre))) {
    throw falla(`Ya existe el curso «${nombre}» en el ciclo ${cicloId}.`);
  }
  const docente = personal.find((p) => p.id === datos.docenteId);
  if (!docente) throw falla('Elige al docente que imparte el curso.');
  if (!puedeImpartir(docente)) throw falla(`${nombrePersona(docente)} no está activo o no tiene el rol Docente.`);
  const materia = datos.materia || null;
  if (materia && !materias.some((m) => m.id === materia)) throw falla('La materia no existe en el plan de estudios.');
  const horaInicio = datos.horaInicio ?? '10:00';
  if (typeof horaInicio !== 'string' || !RE_HORA.test(horaInicio)) throw falla('La hora de inicio debe tener el formato HH:MM.');
  if (Number(horaInicio.slice(0, 2)) + HORAS_CURSO > 24) throw falla(`El curso dura ${HORAS_CURSO} horas: debe terminar el mismo día.`);
  return { nombre, docenteId: docente.id, materia, horaInicio };
}

export function cursoConDerivados(curso, ciclo, obligatorios) {
  const semana = curso.fecha
    ? { inicio: curso.fecha, fin: curso.fecha }
    : ciclo?.semanas.find((s) => s.numero === SEMANA_CURSO) ?? null;
  const [h, m] = curso.horaInicio.split(':');
  return {
    ...curso,
    semana: semana ? { inicio: semana.inicio, fin: semana.fin } : null,
    horaFin: `${String(Number(h) + HORAS_CURSO).padStart(2, '0')}:${m}`,
    fecha: curso.fecha ?? null,
    folios: curso.folios ?? {},
    obligatorios,
  };
}

export function ordenarCursos(cursos) {
  return [...cursos].sort((a, b) => (b.cicloId ?? '').localeCompare(a.cicloId ?? '') || comparar(a.nombre, b.nombre));
}

export const ROL_ADMINISTRADOR_TI = 'administrador-ti';
const APP_RESPALDO = 'SIGESED';

export function armarRespaldo(datos, version) {
  return { app: APP_RESPALDO, version, generadoEn: new Date().toISOString(), generadoPor: usuarioActual().id, datos };
}

export const VERSION_MINIMA_RESPALDO = 17;

export function validarRespaldo(respaldo, version, almacenes) {
  if (!respaldo || typeof respaldo !== 'object' || respaldo.app !== APP_RESPALDO || !respaldo.datos || typeof respaldo.datos !== 'object') {
    throw falla('El archivo no es un respaldo de SIGESED.');
  }
  if (!Number.isInteger(respaldo.version) || respaldo.version < VERSION_MINIMA_RESPALDO || respaldo.version > version) {
    throw falla(`El respaldo es de una versión de la base de datos que no se puede restaurar (${respaldo.version}); se aceptan de la ${VERSION_MINIMA_RESPALDO} a la ${version}.`);
  }
  const limpio = {};
  almacenes.forEach(({ store, clave }) => {
    const filas = respaldo.datos[store] ?? [];
    if (!Array.isArray(filas)) throw falla(`El respaldo está dañado: «${store}» no es una lista.`);
    const claves = new Set();
    filas.forEach((f) => {
      if (!f || typeof f !== 'object' || (typeof f[clave] !== 'string' && typeof f[clave] !== 'number')) {
        throw falla(`El respaldo está dañado: hay un registro sin «${clave}» en «${store}».`);
      }
      if (claves.has(f[clave])) throw falla(`El respaldo está dañado: «${store}» tiene registros repetidos.`);
      claves.add(f[clave]);
    });
    limpio[store] = filas;
  });
  if (limpio.catalogos.length === 0) throw falla('El respaldo está dañado: no tiene catálogos.');
  return limpio;
}

const PREFIJO_MENCION = 'MH';
export const MOTIVO_MENCION = 'titulacion';

export function prepararMencion(datos, estudiante, menciones) {
  if (!datos || typeof datos !== 'object') throw falla('Faltan los datos de la mención honorífica.');
  const fecha = aIso(exigirFecha(datos.fecha, 'La fecha de la mención'));
  if (menciones.some((m) => m.estudianteId === estudiante.id && m.motivo === MOTIVO_MENCION)) {
    throw falla(`${nombrePersona(estudiante)} ya tiene la mención honorífica.`);
  }
  const base = `${PREFIJO_MENCION}-${fecha.slice(0, 4)}-`;
  const usados = menciones.map((m) => m.folio).filter((f) => f?.startsWith(base)).map((f) => Number(f.slice(base.length)) || 0);
  return { estudianteId: estudiante.id, motivo: MOTIVO_MENCION, fecha, folio: `${base}${String(Math.max(0, ...usados) + 1).padStart(4, '0')}` };
}
