export const CALIFICACION_MINIMA = 1;
export const CALIFICACION_MAXIMA = 10;

export function evaluacionDe(evaluaciones, estudianteId, cicloId) {
  return evaluaciones.find((e) => e.estudianteId === estudianteId && e.cicloId === cicloId) ?? null;
}

export function materiasDelPrograma(materias, programaEducativo) {
  return materias.filter((m) => m.programaEducativo === programaEducativo);
}

export function ajustarCalificacion(texto) {
  if (texto.trim() === '') return '';
  const numero = Math.round(Number(texto));
  if (Number.isNaN(numero)) return '';
  return String(Math.min(CALIFICACION_MAXIMA, Math.max(CALIFICACION_MINIMA, numero)));
}
