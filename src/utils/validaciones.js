const RE_CCT = /^\d{2}[A-Z]{3}\d{4}[A-Z]$/;
const RE_USUARIO_GMAIL = /^(?=.{6,30}$)[a-z0-9]+(\.[a-z0-9]+)*$/;
const RE_TELEFONO = /^\d{10}$/;

export const esCCT = (v) => RE_CCT.test(v.trim().toUpperCase());
export const esTelefono = (v) => RE_TELEFONO.test(v.trim());

export const MENSAJES_FORMATO = {
  cct: 'Formato: 2 dígitos, 3 letras, 4 dígitos y 1 letra (ej. 09DPR1234X).',
  correo: 'De 6 a 30 letras, números o puntos (sin punto al inicio, al final ni dos seguidos).',
  telefono: 'Escribe 10 dígitos, sin espacios.',
};

export const DOMINIO_CORREO = '@gmail.com';

export function usuarioDeCorreo(correo = '') {
  return correo.toLowerCase().endsWith(DOMINIO_CORREO) ? correo.slice(0, -DOMINIO_CORREO.length) : correo;
}

export function correoCompleto(usuario) {
  return `${usuarioDeCorreo(usuario).trim().toLowerCase()}${DOMINIO_CORREO}`;
}

export const esUsuarioGmail = (v) => RE_USUARIO_GMAIL.test(usuarioDeCorreo(v).trim().toLowerCase());
