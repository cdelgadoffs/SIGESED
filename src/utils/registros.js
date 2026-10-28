import { coincideBusqueda } from './texto.js';

export function nombreDeCatalogo(catalogo, id) {
  if (!id) return '';
  return catalogo.find((e) => e.id === id)?.nombre ?? id;
}

const ESTILO_GENERO = {
  mujer: { icono: 'ri-women-line', tono: 'morado' },
  hombre: { icono: 'ri-men-line', tono: 'azul' },
};

export function estiloGenero(id) {
  return ESTILO_GENERO[id] ?? { tono: 'gris' };
}

export function opcionesDeCatalogo(catalogo) {
  return catalogo.map((e) => ({ id: e.id, label: e.nombre }));
}

export function nombreCompleto(persona) {
  return [persona.nombre, persona.primerApellido, persona.segundoApellido].filter(Boolean).join(' ');
}

export function filtrarPersonas(personas, termino) {
  return personas.filter((p) => coincideBusqueda(termino, [nombreCompleto(p), p.telefono, p.correo, p.matricula]));
}

export function registroActivo(registros, id) {
  return registros.find((r) => r.id === id) ?? registros[0] ?? null;
}
