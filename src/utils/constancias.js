import { fechaLarga } from './fechas.js';

export const HORAS_CURSO = 3;
export const ROLES_FIRMA = [
  { id: 'coordinador-educativo', etiqueta: 'Coordinación educativa' },
  { id: 'administrador-escolar', etiqueta: 'Administración escolar' },
];

function escapar(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function sinDia(iso) {
  return fechaLarga(iso).replace(/^[^,]+,\s*/, '');
}

export function textoPeriodo(semana) {
  return semana ? `del ${sinDia(semana.inicio)} al ${sinDia(semana.fin)}` : 'en la semana de cierre del ciclo';
}

const ESTILOS = `
@page { size: letter; margin: 18mm 20mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.hoja { min-height: 240mm; display: flex; flex-direction: column; break-after: page; }
.hoja:last-child { break-after: auto; }
.encabezado { display: grid; grid-template-columns: 100px 1fr 100px; align-items: center; gap: 12px; padding-bottom: 10px; border-bottom: 2px solid #2c4770; }
.encabezado img { height: 76px; object-fit: contain; }
.encabezado img.derecho { justify-self: end; }
.encabezado .titulos { text-align: center; }
.encabezado .institucion { font-size: 15px; font-weight: 700; color: #2c4770; }
.encabezado .plantel { font-size: 12px; color: #646e7d; margin-top: 3px; }
h1 { margin: 48px 0 8px; text-align: center; font-size: 30px; letter-spacing: 0.32em; color: #2c4770; }
.subtitulo { text-align: center; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #646e7d; }
.otorga { margin-top: 44px; text-align: center; font-size: 13px; color: #444; }
.nombre { margin: 14px auto 0; padding-bottom: 8px; width: 80%; text-align: center; font-size: 24px; font-weight: 700; text-transform: uppercase; border-bottom: 1.5px solid #2c4770; }
.matricula { margin-top: 6px; text-align: center; font-size: 11.5px; color: #646e7d; }
.cuerpo { margin: 30px auto 0; width: 86%; text-align: center; font-size: 14px; line-height: 1.75; }
.cuerpo strong { color: #2c4770; }
.lugar { margin-top: 26px; text-align: center; font-size: 12.5px; color: #444; }
.firmas { margin-top: auto; padding-top: 70px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
.firma { text-align: center; }
.firma .linea { border-top: 1.5px solid #1a1a1a; margin-bottom: 6px; }
.firma .persona { font-size: 12px; font-weight: 700; min-height: 15px; }
.firma .cargo { font-size: 11px; color: #646e7d; margin-top: 2px; }
`;

function hoja(c, comunes) {
  const firmas = comunes.firmas.map((f) => `
    <div class="firma"><div class="linea"></div><div class="persona">${escapar(f.nombre)}</div><div class="cargo">${escapar(f.etiqueta)}</div></div>`).join('');
  return `
    <section class="hoja">
      <div class="encabezado">
        <img src="${comunes.logoIzquierdo}" alt="">
        <div class="titulos"><div class="institucion">${escapar(comunes.institucion)}</div><div class="plantel">${escapar(comunes.plantel)}</div></div>
        <img class="derecho" src="${comunes.logoDerecho}" alt="">
      </div>
      <h1>CONSTANCIA</h1>
      <div class="subtitulo">Curso extracurricular · Ciclo escolar ${escapar(comunes.cicloId)}</div>
      <div class="otorga">Se otorga la presente a</div>
      <div class="nombre">${escapar(c.nombre)}</div>
      ${c.matricula ? `<div class="matricula">Matrícula ${escapar(c.matricula)}</div>` : ''}
      <div class="cuerpo">${c.cuerpo}</div>
      <div class="lugar">${escapar([comunes.municipio, comunes.fecha].filter(Boolean).join(', '))}.</div>
      <div class="firmas">${firmas}</div>
    </section>`;
}

export function cuerpoAlumno({ curso, docente, materia, periodo, horario }) {
  const recupera = materia ? `, correspondiente a la materia <strong>${escapar(materia)}</strong>,` : '';
  return `por haber cursado y acreditado el curso extracurricular <strong>«${escapar(curso)}»</strong>${recupera} impartido por ${escapar(docente)} ${escapar(periodo)}, de ${escapar(horario)}, con una duración de ${HORAS_CURSO} horas.`;
}

export function cuerpoDocente({ curso, materia, periodo, horario, alumnos }) {
  const recupera = materia ? `, correspondiente a la materia <strong>${escapar(materia)}</strong>,` : '';
  return `por haber impartido el curso extracurricular <strong>«${escapar(curso)}»</strong>${recupera} ${escapar(periodo)}, de ${escapar(horario)}, con una duración de ${HORAS_CURSO} horas y ${alumnos} ${alumnos === 1 ? 'alumno inscrito' : 'alumnos inscritos'}.`;
}

export function documentoConstancias({ titulo, constancias, ...comunes }) {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${escapar(titulo)}</title><style>${ESTILOS}</style></head><body>${constancias.map((c) => hoja(c, comunes)).join('')}</body></html>`;
}
