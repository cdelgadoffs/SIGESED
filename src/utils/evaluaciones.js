export const CALIFICACION_MINIMA = 5;
export const CALIFICACION_MAXIMA = 10;

export function evaluacionDe(evaluaciones, estudianteId, cicloId) {
  return evaluaciones.find((e) => e.estudianteId === estudianteId && e.cicloId === cicloId) ?? null;
}

export function materiasDelPrograma(materias, programaEducativo) {
  return materias.filter((m) => m.programaEducativo === programaEducativo);
}

export const NO_PRESENTO = 'NP';

export function filasDeBoleta(materias, calificaciones) {
  return materias.map((m) => {
    const c = calificaciones.find((x) => x.materia === m.id);
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
