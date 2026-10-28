const implementacion = import.meta.env.VITE_API_MODE === 'real'
  ? await import('./ServerConnection/index.js')
  : await import('./LocalAPI/index.js');

export const {
  listarCatalogos,
  obtenerPlantel,
  guardarPlantel,
  listarPersonal,
  crearPersonal,
  editarPersonal,
  eliminarPersonal,
  listarEstudiantes,
  crearEstudiante,
  editarEstudiante,
  eliminarEstudiante,
  listarCiclos,
  crearCiclosAnuales,
} = implementacion;
