import { ApiError } from '../ApiError.js';

const USUARIO = { id: 'usuario-local', nombre: 'Administrador local', rol: 'administrador' };

const RE_CCT = /^\d{2}[A-Z]{3}\d{4}[A-Z]$/;
const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_TELEFONO = /^\d{10}$/;

const CAMPOS_PERSONA = {
  nombre: { etiqueta: 'Nombre(s)', requerido: true, max: 100, capitalizar: true },
  primerApellido: { etiqueta: 'Apellido paterno', requerido: true, max: 100, capitalizar: true },
  segundoApellido: { etiqueta: 'Apellido materno', max: 100, capitalizar: true },
  telefono: { etiqueta: 'Teléfono', formato: RE_TELEFONO, mensajeFormato: 'El teléfono debe tener 10 dígitos.' },
  correo: { etiqueta: 'Correo', max: 150, formato: RE_CORREO, mensajeFormato: 'El correo no es válido.' },
};

const ESPECIFICACIONES = {
  plantel: {
    cct: { etiqueta: 'CCT', requerido: true, mayusculas: true, formato: RE_CCT, mensajeFormato: 'La CCT no tiene un formato válido (ej. 09DPR1234X).' },
    nombre: { etiqueta: 'Nombre', requerido: true, max: 150 },
    nivel: { etiqueta: 'Nivel educativo', requerido: true, catalogo: 'nivelesEducativos' },
    turno: { etiqueta: 'Turno', requerido: true, catalogo: 'turnos' },
    municipio: { etiqueta: 'Municipio', requerido: true, max: 100 },
    domicilio: { etiqueta: 'Domicilio', max: 250 },
    telefono: { etiqueta: 'Teléfono', formato: RE_TELEFONO, mensajeFormato: 'El teléfono debe tener 10 dígitos.' },
  },
  personal: {
    ...CAMPOS_PERSONA,
    genero: { etiqueta: 'Género', requerido: true, catalogo: 'generos' },
    roles: { etiqueta: 'Roles', requerido: true, catalogo: 'roles', tipo: 'lista' },
  },
  estudiante: {
    ...CAMPOS_PERSONA,
    programaEducativo: { etiqueta: 'Programa educativo', requerido: true, catalogo: 'programasEducativos' },
    tiempo: { etiqueta: 'Tiempo', requerido: true, catalogo: 'tiempos' },
    modalidad: { etiqueta: 'Modalidad', requerido: true, catalogo: 'modalidades' },
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

export function prepararRegistro(tipo, datos, catalogos) {
  if (!datos || typeof datos !== 'object') throw falla('Faltan los datos del registro.');
  const limpio = {};
  Object.entries(ESPECIFICACIONES[tipo]).forEach(([campo, def]) => {
    let valor = datos[campo];
    if (def.tipo === 'lista') {
      limpio[campo] = validarLista(def, valor, catalogos);
      return;
    }
    if (valor === undefined || valor === null) valor = '';
    if (typeof valor !== 'string') throw falla(`El campo «${def.etiqueta}» debe ser texto.`);
    valor = valor.trim();
    if (def.mayusculas) valor = valor.toUpperCase();
    if (def.capitalizar) valor = capitalizarPalabras(valor.replace(/\s+/g, ' '));
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

export function ordenarCiclos(ciclos) {
  return [...ciclos].sort((a, b) => a.anio - b.anio || a.numero - b.numero);
}

const comparar = (a = '', b = '') => a.localeCompare(b, 'es', { sensitivity: 'base' });

export function ordenarPersonas(registros) {
  return [...registros].sort((a, b) => comparar(a.primerApellido, b.primerApellido)
    || comparar(a.segundoApellido, b.segundoApellido)
    || comparar(a.nombre, b.nombre));
}
