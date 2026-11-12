export const CALIFICACION_MINIMA = 5;
export const CALIFICACION_MAXIMA = 10;

export function evaluacionDe(evaluaciones, estudianteId, cicloId) {
  return evaluaciones.find((e) => e.estudianteId === estudianteId && e.cicloId === cicloId) ?? null;
}

import { inscripcionDelEstudiante } from './inscripciones.js';

export function materiasInscritas(materias, inscripciones, cicloId, estudiante) {
  const inscritas = new Set((inscripcionDelEstudiante(inscripciones, cicloId, estudiante)?.materias ?? []).map((m) => m.materia));
  return materias.filter((m) => inscritas.has(m.id));
}

export const NO_PRESENTO = 'NP';

export const REGISTRADA_EN_KARDEX = 'Registrada en kárdex';

export function filasDeBoleta(materias, calificaciones, acreditadas = new Set()) {
  return materias.map((m) => {
    const c = calificaciones.find((x) => x.materia === m.id);
    if (!c && acreditadas.has(m.id)) return { materia: m.nombre, calificacion: REGISTRADA_EN_KARDEX };
    return { materia: m.nombre, calificacion: c ? c.calificacion : NO_PRESENTO };
  });
}

export function ajustarCalificacion(texto) {
  if (texto.trim() === '') return '';
  const numero = Math.round(Number(texto));
  if (Number.isNaN(numero)) return '';
  return String(Math.min(CALIFICACION_MAXIMA, Math.max(0, numero)));
}

export function calificacionValida(texto) {
  const n = Number(texto);
  return texto !== '' && Number.isInteger(n) && n >= CALIFICACION_MINIMA && n <= CALIFICACION_MAXIMA;
}
