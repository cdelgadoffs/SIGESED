import { CALIFICACION_APROBATORIA } from './kardex.js';

export function reprobadosPorMateria(kardex, estudiantes) {
  const activos = new Set(estudiantes.filter((e) => e.activo !== false).map((e) => e.id));
  const conteo = new Map();
  kardex.filter((k) => activos.has(k.estudianteId)).forEach((k) => {
    k.cuatrimestres.flatMap((c) => c.materias)
      .filter((m) => m.calificacion === null || m.calificacion < CALIFICACION_APROBATORIA)
      .forEach((m) => conteo.set(m.materia, (conteo.get(m.materia) ?? 0) + 1));
  });
  return conteo;
}

export function inscritosDe(curso) {
  return [
    ...curso.obligatorios.map((id) => ({ id, tipo: 'obligatorio' })),
    ...curso.voluntarios.filter((id) => !curso.obligatorios.includes(id)).map((id) => ({ id, tipo: 'voluntario' })),
  ];
}
