import { nombreCuatrimestre } from './planEstudios.js';

export const ANCHO_HOJA_KARDEX = 816;
export const ALTO_HOJA_KARDEX = 1056;
export const CALIFICACION_APROBATORIA = 7;
export const OBSERVACION_REPROBADA = 'EXTRACURRICULAR';

export const NO_PRESENTO_KARDEX = 'NP';

export function textoCalificacion(m) {
  return m.calificacion ?? NO_PRESENTO_KARDEX;
}

export function acreditadasFuera(kardex, cicloId) {
  return new Set((kardex?.cuatrimestres ?? []).flatMap((c) => c.materias)
    .filter((m) => m.calificacion >= CALIFICACION_APROBATORIA && m.cicloId !== cicloId)
    .map((m) => m.materia));
}

export function observacionKardex(m) {
  return m.calificacion !== null && m.calificacion < CALIFICACION_APROBATORIA ? [OBSERVACION_REPROBADA, m.observaciones].filter(Boolean).join(' · ') : m.observaciones;
}

function escapar(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function formatoPromedio(n) {
  return n === null || n === undefined ? '—' : n.toFixed(2);
}

const ESTILOS = `
@page { size: letter; margin: 12mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #fff; }
body { font-family: Arial, Helvetica, sans-serif; color: #191919; font-size: 10px; line-height: 1.35; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
@media screen { body { padding: 12mm; } }
#kardex { display: flex; flex-direction: column; }
.encabezado { display: grid; grid-template-columns: 90px 1fr 90px; align-items: center; gap: 12px; padding-bottom: 8px; border-bottom: 2px solid #2c4770; }
.encabezado img { height: 68px; object-fit: contain; }
.encabezado img.derecho { justify-self: end; }
.titulos { text-align: center; }
.titulos h1 { font-size: 19px; letter-spacing: 0.04em; color: #2c4770; }
.titulos .institucion { font-size: 12.5px; color: #646e7d; margin-top: 2px; }
.titulos .alumno { font-size: 16px; font-weight: 700; margin-top: 6px; text-transform: uppercase; }
.datos { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; text-align: center; padding: 10px 0 8px; border-bottom: 1px solid #d2dae6; }
.datos span { display: block; font-size: 9px; color: #646e7d; }
.datos strong { display: block; font-size: 11px; margin-top: 1px; }
.promedio { display: flex; justify-content: space-between; margin: 10px 0 14px; padding: 8px 12px; background: #edf2fa; border: 1px solid #dce4f0; font-size: 12px; font-weight: 700; color: #2c4770; }
.cuatrimestres { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 16px; }
.cuatrimestre { break-inside: avoid; }
.cuatrimestre.solo { grid-column: 1 / -1; }
.cuatrimestre h2 { font-size: 11px; color: #2c4770; margin-bottom: 4px; padding-left: 4px; }
table { width: 100%; border-collapse: collapse; }
th { background: #dce4f0; color: #2c4770; font-size: 9.5px; text-align: left; padding: 4px 6px; border-top: 1px solid #bec8d7; border-bottom: 1px solid #bec8d7; }
th.cal, td.cal { width: 52px; text-align: center; }
td { padding: 4px 6px; border-bottom: 1px solid #bec8d7; font-size: 10px; }
tr:nth-child(even) td { background: #f5f7fa; }
td.cal { font-weight: 700; }
td.aprobada { color: #166e37; }
td.reprobada { color: #a51e1e; }
.ciclo { margin-left: 6px; font-size: 8.5px; color: #4a6fa5; white-space: nowrap; }
.prom-cuatri { font-size: 9.5px; font-style: italic; color: #4a6fa5; padding: 3px 6px 0; }
.seccion { margin-top: 16px; padding-top: 10px; border-top: 1px solid #d2dae6; break-inside: avoid; }
.seccion h3 { font-size: 11px; color: #2c4770; margin-bottom: 6px; }
.firma { text-align: center; }
.firma p { color: #646e7d; }
.firma .espacio { height: 90px; }
.firma .nombre { font-weight: 700; font-size: 10.5px; }
.firma .linea { width: 340px; margin: 4px auto 3px; border-top: 1.5px solid #2c4770; }
.firma .etiqueta { font-size: 9.5px; color: #646e7d; }
.pie { margin-top: 18px; padding-top: 6px; border-top: 1px solid #d2dae6; display: flex; justify-content: space-between; font-size: 9px; font-style: italic; color: #646e7d; }
`;

function tablaCuatrimestre(c, solo) {
  const filas = c.materias.map((m) => {
    const clase = m.calificacion >= CALIFICACION_APROBATORIA ? 'aprobada' : 'reprobada';
    const ciclo = m.cicloId ? `<span class="ciclo">Ciclo ${escapar(m.cicloId)}</span>` : '';
    return `<tr><td>${escapar(m.nombre)}${ciclo}</td><td class="cal ${clase}">${textoCalificacion(m)}</td></tr>`;
  }).join('');
  const n = c.materias.length;
  return `
    <div class="cuatrimestre${solo ? ' solo' : ''}">
      <h2>${escapar(nombreCuatrimestre(c.numero))}</h2>
      <table><thead><tr><th>Materia</th><th class="cal">Calif.</th></tr></thead><tbody>${filas}</tbody></table>
      <div class="prom-cuatri">Promedio: ${formatoPromedio(c.promedio)} (${n} materia${n === 1 ? '' : 's'})</div>
    </div>`;
}

export function documentoKardex({
  institucion, plantel, alumno, matricula, programa, tiempo, modalidad, grupo,
  cuatrimestres, promedioGeneral, totalMaterias, incluirFirma, fecha, logoIzquierdo, logoDerecho,
}) {
  const bloques = cuatrimestres.map((c, i) => tablaCuatrimestre(c, i === cuatrimestres.length - 1 && i % 2 === 0)).join('');
  const observaciones = cuatrimestres.flatMap((c) => c.materias)
    .map((m) => ({ ...m, observaciones: observacionKardex(m) }))
    .filter((m) => m.observaciones);
  const tablaObservaciones = observaciones.length ? `
    <div class="seccion">
      <h3>OBSERVACIONES</h3>
      <table><thead><tr><th style="width:38%">Materia</th><th>Detalles</th></tr></thead>
      <tbody>${observaciones.map((m) => `<tr><td>${escapar(m.nombre)}</td><td>${escapar(m.observaciones)}</td></tr>`).join('')}</tbody></table>
    </div>` : '';
  const firma = incluirFirma ? `
    <div class="seccion firma">
      <h3>CONFORMIDAD DEL ESTUDIANTE</h3>
      <p>El suscrito declara haber revisado y estar conforme con las calificaciones del presente kárdex.</p>
      <div class="espacio"></div>
      <div class="nombre">${escapar(alumno)}</div>
      <div class="linea"></div>
      <div class="etiqueta">Firma del estudiante</div>
    </div>` : '';
  const dato = (etiqueta, valor) => `<div><span>${etiqueta}</span><strong>${escapar(valor || '—')}</strong></div>`;
  const titulo = `Kardex_${alumno}`.replace(/\s+/g, '_');

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${escapar(titulo)}</title><style>${ESTILOS}</style></head><body>
  <div id="kardex">
    <div class="encabezado">
      <img src="${logoIzquierdo}" alt="">
      <div class="titulos">
        <h1>KÁRDEX ACADÉMICO INDIVIDUAL</h1>
        <div class="institucion">${escapar([institucion, plantel].filter(Boolean).join(' · '))}</div>
        <div class="alumno">${escapar(alumno)}</div>
      </div>
      <img class="derecho" src="${logoDerecho}" alt="">
    </div>
    <div class="datos">
      ${dato('Matrícula', matricula)}
      ${dato('Programa académico', programa)}
      ${dato('Grupo', grupo)}
      ${dato('Tiempo', tiempo)}
      ${dato('Modalidad', modalidad)}
    </div>
    <div class="promedio"><span>Promedio general: ${formatoPromedio(promedioGeneral)}</span><span>Total de materias: ${totalMaterias}</span></div>
    <div class="cuatrimestres">${bloques}</div>
    ${tablaObservaciones}
    ${firma}
    <div class="pie"><span>${escapar(fecha)}</span><span>${escapar(institucion)}</span></div>
  </div>
  </body></html>`;
}
