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
};
