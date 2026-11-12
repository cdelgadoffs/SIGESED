import PLAN_ESTUDIOS from './planEstudios.json';

const HORAS_CLASE = [
  { id: 'semanal-1', modalidad: 'semanal', numero: 1, nombre: '1ª hora', inicio: '08:00', fin: '09:00', descanso: false },
  { id: 'semanal-2', modalidad: 'semanal', numero: 2, nombre: '2ª hora', inicio: '09:00', fin: '09:50', descanso: false },
  { id: 'semanal-receso', modalidad: 'semanal', numero: null, nombre: 'Receso', inicio: '09:50', fin: '10:10', descanso: true },
  { id: 'semanal-3', modalidad: 'semanal', numero: 3, nombre: '3ª hora', inicio: '10:10', fin: '11:00', descanso: false },
  { id: 'semanal-4', modalidad: 'semanal', numero: 4, nombre: '4ª hora', inicio: '11:00', fin: '12:00', descanso: false },
  { id: 'semanal-5', modalidad: 'semanal', numero: 5, nombre: '5ª hora', inicio: '12:00', fin: '13:00', descanso: false },
  { id: 'sabatino-1', modalidad: 'sabatino', numero: 1, nombre: '1ª hora', inicio: '08:00', fin: '09:00', descanso: false },
  { id: 'sabatino-2', modalidad: 'sabatino', numero: 2, nombre: '2ª hora', inicio: '09:00', fin: '09:50', descanso: false },
  { id: 'sabatino-receso', modalidad: 'sabatino', numero: null, nombre: 'Receso', inicio: '09:50', fin: '10:10', descanso: true },
  { id: 'sabatino-3', modalidad: 'sabatino', numero: 3, nombre: '3ª hora', inicio: '10:10', fin: '11:00', descanso: false },
  { id: 'sabatino-4', modalidad: 'sabatino', numero: 4, nombre: '4ª hora', inicio: '11:00', fin: '12:00', descanso: false },
  { id: 'sabatino-5', modalidad: 'sabatino', numero: 5, nombre: '5ª hora', inicio: '12:00', fin: '13:00', descanso: false },
  { id: 'sabatino-6', modalidad: 'sabatino', numero: 6, nombre: '6ª hora', inicio: '13:00', fin: '14:00', descanso: false },
];

export const CATALOGOS_SEMILLA = {
  generos: [
    { id: 'mujer', nombre: 'Mujer' },
    { id: 'hombre', nombre: 'Hombre' },
  ],
  roles: [
    { id: 'administrador-ti', nombre: 'Administrador TI', maximo: 1, asignacion: 'entra-id', permisos: { '*': 'editar' } },
    { id: 'director', nombre: 'Director Administrativo', maximo: 1, asignacion: 'registro', permisos: { '*': 'ver', inicio: 'ninguno', planEstudios: 'ninguno', bitacora: 'ninguno' } },
    { id: 'coordinador-educativo', nombre: 'Coordinador educativo', maximo: null, asignacion: 'registro', permisos: { '*': 'editar' } },
    { id: 'administrador-escolar', nombre: 'Administrador escolar', maximo: null, asignacion: 'registro', permisos: { '*': 'ver', inicio: 'ninguno', planEstudios: 'ninguno', bitacora: 'editar' } },
    { id: 'docente', nombre: 'Docente', maximo: null, asignacion: 'registro', permisos: { horarios: 'ver', evaluaciones: 'propio', bitacora: 'editar' } },
    { id: 'secretario', nombre: 'Secretario', maximo: null, asignacion: 'registro', permisos: { '*': 'ver', inicio: 'ninguno', planEstudios: 'ninguno', bitacora: 'ninguno' } },
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
    { id: 'sabatino', nombre: 'Sabatino', horario: 'sabado' },
    { id: 'semanal', nombre: 'Semanal', horario: 'entre-semana' },
    { id: 'online', nombre: 'Online', horario: null },
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
  horasClase: HORAS_CLASE,
};
