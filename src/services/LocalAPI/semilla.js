export const CATALOGOS_SEMILLA = {
  nivelesEducativos: [
    { id: 'preescolar', nombre: 'Preescolar' },
    { id: 'primaria', nombre: 'Primaria' },
    { id: 'secundaria', nombre: 'Secundaria' },
    { id: 'media-superior', nombre: 'Media superior' },
    { id: 'superior', nombre: 'Superior' },
  ],
  turnos: [
    { id: 'matutino', nombre: 'Matutino' },
    { id: 'vespertino', nombre: 'Vespertino' },
    { id: 'mixto', nombre: 'Mixto' },
  ],
  generos: [
    { id: 'mujer', nombre: 'Mujer' },
    { id: 'hombre', nombre: 'Hombre' },
  ],
  roles: [
    { id: 'administrador-ti', nombre: 'Administrador TI', maximo: 1 },
    { id: 'director', nombre: 'Director', maximo: 1 },
    { id: 'coordinador-educativo', nombre: 'Coordinador educativo', maximo: null },
    { id: 'administrador-escolar', nombre: 'Administrador escolar', maximo: null },
    { id: 'docente', nombre: 'Docente', maximo: null },
    { id: 'secretario', nombre: 'Secretario', maximo: null },
  ],
  programasEducativos: [
    { id: 'bachillerato', nombre: 'Bachillerato' },
    { id: 'licenciatura-pedagogia', nombre: 'Licenciatura en Pedagogía' },
  ],
  tiempos: [
    { id: '1-anio', nombre: '1 año' },
    { id: '2-anios', nombre: '2 años' },
    { id: '3-anios', nombre: '3 años' },
    { id: 'expres', nombre: 'Exprés' },
  ],
  modalidades: [
    { id: 'sabatino', nombre: 'Sabatino' },
    { id: 'semanal', nombre: 'Semanal' },
    { id: 'online', nombre: 'Online' },
  ],
  materias: [
    { id: 'desarrollo-habilidades-docentes', nombre: 'Desarrollo de Habilidades Docentes', programaEducativo: 'licenciatura-pedagogia' },
    { id: 'educacion-america-latina', nombre: 'Educación en América Latina', programaEducativo: 'licenciatura-pedagogia' },
    { id: 'historia-general-educacion-1', nombre: 'Historia General de la Educación 1', programaEducativo: 'licenciatura-pedagogia' },
    { id: 'psicotecnica-pedagogica', nombre: 'Psicotécnica Pedagógica', programaEducativo: 'licenciatura-pedagogia' },
    { id: 'antropologia-filosofica', nombre: 'Antropología Filosófica', programaEducativo: 'licenciatura-pedagogia' },
    { id: 'teoria-pedagogica-1', nombre: 'Teoría Pedagógica 1', programaEducativo: 'licenciatura-pedagogia' },
    { id: 'metodologia-investigacion-1', nombre: 'Metodología de la Investigación 1', programaEducativo: 'licenciatura-pedagogia' },
    { id: 'introduccion-psicologia', nombre: 'Introducción a la Psicología', programaEducativo: 'licenciatura-pedagogia' },
    { id: 'seminario-titulacion-2', nombre: 'Seminario de Titulación 2', programaEducativo: 'licenciatura-pedagogia' },
  ],
};
