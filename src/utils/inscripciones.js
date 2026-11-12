import { DIAS_SEMANA } from './fechas.js';

export const MATERIAS_POR_GRUPO = 3;
export const HORAS_POR_MATERIA = 2;
export const ROL_DOCENTE = 'docente';
export const DIAS_ENTRE_SEMANA = [1, 2, 3, 4, 5];

export function tipoHorario(grupo, modalidades) {
  return modalidades.find((m) => m.id === grupo?.modalidad)?.horario ?? null;
}

export const NUEVO_PERSONALIZADO = 'nuevo';

export function inscripcionDe(inscripciones, cicloId, grupoId) {
  return inscripciones.find((i) => i.cicloId === cicloId && i.grupoId === grupoId && !i.personalizada) ?? null;
}

export function clasesDeOtrosGrupos(inscripciones, grupos, cicloId, grupo) {
  return inscripciones
    .filter((i) => i.cicloId === cicloId && !i.personalizada && i.grupoId !== grupo.id)
    .flatMap((i) => {
      const otro = grupos.find((g) => g.id === i.grupoId);
      if (!otro || otro.programaEducativo !== grupo.programaEducativo || otro.modalidad !== grupo.modalidad) return [];
      return i.materias
        .filter((m) => m.materia && (m.horario ?? []).length > 0)
        .map((m) => ({ grupoId: otro.id, grupoNombre: otro.nombre, materia: m.materia, docenteId: m.docenteId ?? '', horario: m.horario }));
    });
}

export function claseDeOtroGrupo(clases, m) {
  const k = (h) => h.map((b) => `${b.dia}|${b.hora}`).sort().join(',');
  return m.materia && m.horario.length > 0
    ? clases.find((c) => c.materia === m.materia && (c.docenteId || '') === (m.docenteId || '') && k(c.horario) === k(m.horario)) ?? null
    : null;
}

export function personalizadasDe(inscripciones, cicloId, grupoId) {
  return inscripciones.filter((i) => i.cicloId === cicloId && i.grupoId === grupoId && i.personalizada);
}

export function inscripcionDelEstudiante(inscripciones, cicloId, estudiante) {
  if (!estudiante) return null;
  return inscripciones.find((i) => i.cicloId === cicloId && i.personalizada && (i.estudiantes ?? []).includes(estudiante.id))
    ?? inscripcionDe(inscripciones, cicloId, estudiante.grupo);
}

export function estudiantesDelDocente(estudiantes, inscripciones, cicloId, docenteId) {
  return estudiantes.filter((e) => (inscripcionDelEstudiante(inscripciones, cicloId, e)?.materias ?? []).some((m) => m.docenteId === docenteId));
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

export function clasesDelCiclo(inscripciones, cicloId, horasClase) {
  const horas = new Map(horasClase.map((h) => [h.id, h]));
  const sueltas = inscripciones
    .filter((i) => i.cicloId === cicloId)
    .sort((a, b) => Number(!!a.personalizada) - Number(!!b.personalizada))
    .flatMap((i) => i.materias.flatMap((m) => (m.horario ?? [])
      .filter((b) => horas.has(b.hora))
      .map((b) => ({
        dia: b.dia,
        inicio: horas.get(b.hora).inicio,
        fin: horas.get(b.hora).fin,
        grupoId: i.grupoId,
        materia: m.materia,
        docenteId: m.docenteId,
      }))));
  const vistas = new Set();
  const unicas = sueltas.filter((c) => {
    const k = `${c.grupoId}|${c.materia}|${c.dia}|${c.inicio}`;
    const compartida = c.docenteId ? `${c.docenteId}|${c.materia}|${c.dia}|${c.inicio}` : null;
    if (vistas.has(k) || (compartida && vistas.has(compartida))) return false;
    vistas.add(k);
    if (compartida) vistas.add(compartida);
    return true;
  });
  unicas.sort((a, b) => a.dia - b.dia || a.grupoId.localeCompare(b.grupoId) || a.inicio.localeCompare(b.inicio));
  const unidas = unicas.reduce((lista, c) => {
    const ultima = lista[lista.length - 1];
    if (ultima && ultima.dia === c.dia && ultima.grupoId === c.grupoId && ultima.materia === c.materia && ultima.fin === c.inicio) {
      ultima.fin = c.fin;
      return lista;
    }
    lista.push({ ...c });
    return lista;
  }, []);
  return unidas.sort((a, b) => a.dia - b.dia || a.inicio.localeCompare(b.inicio));
}

export function materiasDeDocente(inscripciones, cicloId, docenteId) {
  return inscripciones
    .filter((i) => i.cicloId === cicloId)
    .flatMap((i) => i.materias.filter((m) => m.docenteId === docenteId).map((m) => ({ ...m, grupoId: i.grupoId })))
    .filter((m, i, lista) => lista.findIndex((x) => x.grupoId === m.grupoId && x.materia === m.materia) === i);
}
