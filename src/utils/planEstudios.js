import { coincideBusqueda } from './texto.js';

export const ORDINALES_CUATRIMESTRE = ['Primer', 'Segundo', 'Tercer', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo', 'Noveno'];

export function nombreCuatrimestre(n) {
  return `${ORDINALES_CUATRIMESTRE[n - 1] ?? `${n}.º`} cuatrimestre`;
}

export function cuatrimestresDe(materias) {
  const grupos = new Map();
  materias.forEach((m) => {
    if (!grupos.has(m.cuatrimestre)) grupos.set(m.cuatrimestre, []);
    grupos.get(m.cuatrimestre).push(m);
  });
  return [...grupos.entries()].sort((a, b) => a[0] - b[0]).map(([numero, lista]) => ({ numero, materias: lista }));
}

export function filtrarMaterias(materias, termino) {
  return materias.filter((m) => coincideBusqueda(termino, [
    m.nombre,
    m.clave,
    m.objetivo,
    ...(m.temas ?? []).flatMap((t) => [t.titulo, ...t.items]),
  ]));
}

export function sinNumeroRomano(texto) {
  return texto.replace(/^(?:(?:I{1,3}|IV|V|VI{0,3}|IX|X)\.[0-9]*\s*)/, '').trim();
}

export function textoDeTema(tema) {
  return [tema.titulo, ...tema.items.map((i) => `- ${sinNumeroRomano(i)}`)].join('\n');
}

export const SIN_OBJETIVO = 'No especificado en el documento fuente.';

function escapar(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const ESTILOS = `
@page { size: letter; margin: 20mm 18mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', Roboto, system-ui, sans-serif; color: #1a1a1a; line-height: 1.6; font-size: 12.5px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.portada { display: flex; flex-direction: column; justify-content: center; min-height: 225mm; break-after: page; }
.badge { font-family: Consolas, monospace; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: #1a56db; background: #e8f0fe; display: inline-block; padding: 5px 14px; border-radius: 3px; margin-bottom: 26px; width: fit-content; }
.portada h1 { font-size: 34px; font-weight: 600; line-height: 1.3; margin-bottom: 10px; }
.inst { font-size: 15px; color: #666; margin-bottom: 44px; }
.meta { border-top: 1px solid #e0e0e0; padding-top: 16px; margin-bottom: 34px; font-size: 11.5px; color: #888; font-family: Consolas, monospace; }
.meta div { margin-bottom: 5px; }
.subtitulo { font-family: Consolas, monospace; font-size: 10.5px; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; color: #999; margin: 0 0 12px; break-after: avoid; }
.indice { display: flex; gap: 14px; padding: 7px 0; border-bottom: 1px solid #f0f0f0; font-size: 12.5px; break-inside: avoid; }
.indice .num { font-family: Consolas, monospace; color: #1a56db; min-width: 22px; }
.indice .nombre { flex: 1; }
.indice .cuatri { color: #999; font-size: 11px; white-space: nowrap; }
.materia { display: flex; flex-direction: column; min-height: 225mm; break-before: page; }
.cuerpo { flex: 1 0 auto; }
.encabezado { border-bottom: 2px solid #1a1a1a; padding-bottom: 16px; margin-bottom: 24px; break-inside: avoid; }
.tipo { font-family: Consolas, monospace; font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase; color: #999; margin-bottom: 8px; display: flex; justify-content: space-between; }
.encabezado h2 { font-size: 23px; font-weight: 600; margin-bottom: 8px; }
.clave { font-family: Consolas, monospace; font-size: 11.5px; color: #1a56db; background: #e8f0fe; padding: 3px 10px; border-radius: 3px; }
.objetivo { margin: 0 0 26px; padding: 14px 18px; background: #f7f9fc; border-left: 3px solid #1a56db; border-radius: 0 4px 4px 0; break-inside: avoid; }
.objetivo strong { display: block; font-family: Consolas, monospace; font-size: 9.5px; letter-spacing: .06em; text-transform: uppercase; color: #1a56db; margin-bottom: 5px; }
.tarjeta { border: 1px solid #e8e8e8; border-radius: 6px; padding: 14px 18px; margin-bottom: 14px; break-inside: avoid; }
.tarjeta .titulo { font-weight: 600; font-size: 13px; display: block; margin-bottom: 8px; }
.tarjeta ul { margin: 0 0 0 20px; }
.tarjeta li { font-size: 11.5px; color: #444; margin-bottom: 4px; }
.columnas { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 14px; break-inside: avoid; }
th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #eee; font-size: 11.5px; }
th { font-family: Consolas, monospace; font-size: 10px; text-transform: uppercase; color: #888; }
td:last-child, th:last-child { text-align: right; white-space: nowrap; }
.pie { margin-top: auto; padding-top: 14px; border-top: 1px solid #e0e0e0; font-size: 10px; color: #999; display: flex; justify-content: space-between; font-family: Consolas, monospace; }
.solo .materia { min-height: 0; break-before: auto; margin-bottom: 26px; }
.solo .encabezado { margin-bottom: 14px; padding-bottom: 10px; }
.solo .encabezado h2 { font-size: 17px; }
`;

function lista(items) {
  return `<ul>${items.map((i) => `<li>${escapar(sinNumeroRomano(i))}</li>`).join('')}</ul>`;
}

function seccionMateria(m, indice, total, { institucion, programa, soloTemas }) {
  const temas = (m.temas ?? []).map((t) => `<div class="tarjeta"><span class="titulo">${escapar(t.titulo)}</span>${lista(t.items)}</div>`).join('');
  let extra = '';
  if (!soloTemas) {
    const docente = m.actividadesDocente?.length ? m.actividadesDocente : ['No especificadas'];
    const independiente = m.actividadesIndependiente?.length ? m.actividadesIndependiente : ['No especificadas'];
    const filas = (m.evaluacion ?? []).map((e) => `<tr><td>${escapar(e.concepto)}</td><td>${escapar(e.porcentaje)}</td></tr>`).join('')
      || '<tr><td colspan="2">Sin información</td></tr>';
    extra = `
      <div class="subtitulo">Actividades de aprendizaje</div>
      <div class="columnas">
        <div class="tarjeta"><span class="titulo">Bajo la conducción de un docente</span>${lista(docente)}</div>
        <div class="tarjeta"><span class="titulo">Independientes</span>${lista(independiente)}</div>
      </div>
      <div class="subtitulo">Criterios y procedimientos de evaluación</div>
      <table><thead><tr><th>Concepto</th><th>Porcentaje</th></tr></thead><tbody>${filas}</tbody></table>`;
  }
  const objetivo = !soloTemas && m.objetivo && m.objetivo !== SIN_OBJETIVO
    ? `<div class="objetivo"><strong>Objetivo general</strong>${escapar(m.objetivo)}</div>`
    : '';
  const pie = soloTemas ? '' : `<div class="pie"><span>${escapar([institucion, programa].filter(Boolean).join(' · '))}</span><span>${escapar(m.clave)}</span></div>`;
  return `
    <section class="materia"><div class="cuerpo">
      <div class="encabezado">
        <div class="tipo"><span>Asignatura · ${escapar(nombreCuatrimestre(m.cuatrimestre))}</span><span>${String(indice + 1).padStart(2, '0')} / ${total}</span></div>
        <h2>${escapar(m.nombre)}</h2>
        <span class="clave">${escapar(m.clave)}</span>
      </div>
      ${objetivo}
      ${temas ? `<div class="subtitulo">Temas y subtemas</div>${temas}` : ''}
      ${extra}
    </div>${pie}</section>`;
}

export function documentoPlanEstudios({ materias, institucion, programa, titulo, soloTemas = false, fecha }) {
  const total = materias.length;
  const portada = soloTemas ? '' : `
    <div class="portada">
      <span class="badge">Plan de estudios</span>
      <h1>${escapar(programa)}</h1>
      <div class="inst">${escapar(institucion)}</div>
      <div class="meta"><div>Documento generado: ${escapar(fecha)}</div><div>Materias incluidas: ${total}</div></div>
      <div class="subtitulo">Contenido</div>
      ${materias.map((m, i) => `<div class="indice"><span class="num">${String(i + 1).padStart(2, '0')}</span><span class="nombre">${escapar(m.nombre)}</span><span class="cuatri">${escapar(m.clave)} · ${escapar(nombreCuatrimestre(m.cuatrimestre))}</span></div>`).join('')}
    </div>`;
  const cuerpo = materias.map((m, i) => seccionMateria(m, i, total, { institucion, programa, soloTemas })).join('');
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${escapar(titulo)}</title><style>${ESTILOS}</style></head><body${soloTemas ? ' class="solo"' : ''}>${portada}${cuerpo}</body></html>`;
}
