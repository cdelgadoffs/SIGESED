const RE_CCT = /^\d{2}[A-Z]{3}\d{4}[A-Z]$/;
const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_TELEFONO = /^\d{10}$/;

export const esCCT = (v) => RE_CCT.test(v.trim().toUpperCase());
export const esCorreo = (v) => RE_CORREO.test(v.trim());
export const esTelefono = (v) => RE_TELEFONO.test(v.trim());

export const MENSAJES_FORMATO = {
  cct: 'Formato: 2 dígitos, 3 letras, 4 dígitos y 1 letra (ej. 09DPR1234X).',
  correo: 'Escribe un correo válido.',
  telefono: 'Escribe 10 dígitos, sin espacios.',
};
