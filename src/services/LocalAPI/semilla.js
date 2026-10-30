import PLAN_ESTUDIOS from './planEstudios.json';

export const CATALOGOS_SEMILLA = {
  generos: [
    { id: 'mujer', nombre: 'Mujer' },
    { id: 'hombre', nombre: 'Hombre' },
  ],
  roles: [
    { id: 'administrador-ti', nombre: 'Administrador TI', maximo: 1, asignacion: 'entra-id' },
    { id: 'director', nombre: 'Director', maximo: 1, asignacion: 'registro' },
    { id: 'coordinador-educativo', nombre: 'Coordinador educativo', maximo: null, asignacion: 'registro' },
    { id: 'administrador-escolar', nombre: 'Administrador escolar', maximo: null, asignacion: 'registro' },
    { id: 'docente', nombre: 'Docente', maximo: null, asignacion: 'registro' },
    { id: 'secretario', nombre: 'Secretario', maximo: null, asignacion: 'registro' },
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
  semanasCiclo: [
    { id: 'semana-1', nombre: 'Semana 1', numero: 1 },
    { id: 'semana-2', nombre: 'Semana 2', numero: 2 },
    { id: 'semana-3', nombre: 'Semana 3', numero: 3 },
    { id: 'semana-4', nombre: 'Semana 4', numero: 4 },
    { id: 'semana-5', nombre: 'Semana 5', numero: 5 },
    { id: 'semana-6', nombre: 'Semana 6', numero: 6 },
    { id: 'examenes', nombre: 'Periodo de exámenes', numero: 7 },
    { id: 'cierre', nombre: 'Cierre de ciclo', numero: 8 },
  ],
  tiposReporte: [
    { id: 'conducta', nombre: 'Conducta' },
    { id: 'presentacion', nombre: 'Uniforme o presentación' },
    { id: 'puntualidad', nombre: 'Puntualidad' },
    { id: 'celular', nombre: 'Uso de celular' },
    { id: 'instalaciones', nombre: 'Daño a instalaciones' },
    { id: 'otro', nombre: 'Otro' },
  ],
  materias: PLAN_ESTUDIOS,
};
