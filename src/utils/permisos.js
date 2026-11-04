const MODULO_DE_VISTA = {
  grupos: 'matricula',
  personal: 'matricula',
  estudiantes: 'matricula',
};

const VISTAS_DE_RESPALDO = [
  'inicio', 'horarios', 'planEstudios', 'evaluaciones', 'kardex', 'estudiantes', 'grupos', 'personal',
  'bitacora', 'cursos', 'asistencia', 'planTrabajo',
];

export function moduloDeVista(vista) {
  return MODULO_DE_VISTA[vista] ?? vista;
}

export function primeraVistaPermitida(puede) {
  return VISTAS_DE_RESPALDO.find((vista) => puede(moduloDeVista(vista))) ?? null;
}
