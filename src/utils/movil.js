export const SECCIONES_MOVIL = [
  { id: 'inicio', etiqueta: 'Inicio', icono: 'ri-home-4-line', siempre: true },
  { id: 'horarios', etiqueta: 'Horario', icono: 'ri-time-line', detalle: 'Las clases de hoy y de la semana' },
  { id: 'bitacora', etiqueta: 'Bitácora', icono: 'ri-draft-line', detalle: 'Levantar un reporte de una alumna' },
  { id: 'kardex', etiqueta: 'Kárdex', icono: 'ri-file-user-line', detalle: 'Consultar las calificaciones de un estudiante' },
  { id: 'evaluaciones', etiqueta: 'Evaluaciones', icono: 'ri-file-edit-line', detalle: 'Capturar calificaciones del ciclo' },
];

export const MODULOS_SOLO_ESCRITORIO = [
  { id: 'asistencia', etiqueta: 'Asistencia general', icono: 'ri-calendar-check-line' },
  { id: 'cursos', etiqueta: 'Cursos extracurriculares', icono: 'ri-award-line' },
  { id: 'estudiantes', etiqueta: 'Matrícula', icono: 'ri-team-line' },
  { id: 'planEstudios', etiqueta: 'Plan de estudios', icono: 'ri-book-open-line' },
  { id: 'planTrabajo', etiqueta: 'Plan de trabajo', icono: 'ri-task-line' },
].map((m) => ({ ...m, detalle: 'Disponible en la versión de escritorio', escritorio: true }));
