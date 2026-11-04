import { DIAS_SEMANA } from './fechas.js';

export const MATERIAS_POR_GRUPO = 3;
export const HORAS_POR_MATERIA = 2;
export const ROL_DOCENTE = 'docente';
export const DIAS_ENTRE_SEMANA = [1, 2, 3, 4, 5];

export function tipoHorario(grupo, modalidades) {
  return modalidades.find((m) => m.id === grupo?.modalidad)?.horario ?? null;
}

export function inscripcionDe(inscripciones, cicloId, grupoId) {
  return inscripciones.find((i) => i.cicloId === cicloId && i.grupoId === grupoId) ?? null;
}

export function puedeImpartir(persona) {
  return !!persona && persona.activo !== false && (persona.roles || []).includes(ROL_DOCENTE);
}

export const DIA_SABADO = 6;

export function diasDeHorario(tipo) {
  return tipo === 'sabado' ? [DIA_SABADO] : DIAS_ENTRE_SEMANA;
}

export function horasDeModalidad(horasClase, grupo) {
  return horasClase.filter((h) => h.modalidad === grupo?.modalidad);
}

const sinCero = (hora) => hora.replace(/^0/, '');

export function tramosHorario(horario, horasClase) {
  const dias = [...new Set(horario.map((b) => b.dia))].sort((a, b) => a - b);
  return dias.flatMap((dia) => {
    const horas = horario
      .filter((b) => b.dia === dia)
      .map((b) => horasClase.find((h) => h.id === b.hora))
      .filter(Boolean)
      .sort((a, b) => a.numero - b.numero);
    const tramos = [];
    horas.forEach((h) => {
      const ultimo = tramos[tramos.length - 1];
      if (ultimo && ultimo[ultimo.length - 1].numero === h.numero - 1) ultimo.push(h);
      else tramos.push([h]);
    });
    return tramos.map((tr) => ({ dia, texto: `${DIAS_SEMANA[dia]} ${sinCero(tr[0].inicio)}–${sinCero(tr[tr.length - 1].fin)}` }));
  });
}

export function textoHorario(horario, horasClase) {
  const dias = [...new Set(horario.map((b) => b.dia))].sort((a, b) => a - b);
  return dias.map((dia) => {
    const horas = horario
      .filter((b) => b.dia === dia)
      .map((b) => horasClase.find((h) => h.id === b.hora))
      .filter(Boolean)
      .sort((a, b) => a.numero - b.numero);
    const tramos = [];
    horas.forEach((h) => {
      const ultimo = tramos[tramos.length - 1];
      if (ultimo && ultimo[ultimo.length - 1].numero === h.numero - 1) ultimo.push(h);
      else tramos.push([h]);
    });
    const texto = tramos.map((tr) => {
      const primera = tr[0];
      const ultima = tr[tr.length - 1];
      const nombres = tr.length === 1 ? `${primera.numero}ª` : `${primera.numero}ª–${ultima.numero}ª`;
      return `${nombres} (${sinCero(primera.inicio)}–${sinCero(ultima.fin)})`;
    }).join(', ');
    return `${DIAS_SEMANA[dia]} ${texto}`;
  }).join('; ');
}

export function cursaronAntes(materiaId, alumnos, evaluaciones, cicloId) {
  return alumnos.filter((a) => evaluaciones.some((e) => e.estudianteId === a.id && e.cicloId !== cicloId
    && e.calificaciones.some((c) => c.materia === materiaId)));
}

export function materiasDeDocente(inscripciones, cicloId, docenteId) {
  return inscripciones
    .filter((i) => i.cicloId === cicloId)
    .flatMap((i) => i.materias.filter((m) => m.docenteId === docenteId).map((m) => ({ ...m, grupoId: i.grupoId })));
}
