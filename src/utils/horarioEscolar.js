import { DIAS_SEMANA } from './fechas.js';

export const DIAS_POR_TIPO = { 'entre-semana': [1, 2, 3, 4, 5], sabado: [6] };

export const COLORES_DIA = {
  1: { fondo: '#ffc7ce', acento: '#e0607a' },
  2: { fondo: '#f7c7ac', acento: '#d9804f' },
  3: { fondo: '#ffeb9c', acento: '#d4a514' },
  4: { fondo: '#c6efce', acento: '#3f9d5c' },
  5: { fondo: '#caedfb', acento: '#2f97c9' },
  6: { fondo: '#ffc7ce', acento: '#e0607a' },
};

const AZUL = '#0078d4';

const ESTILOS = (fuentes) => `
@font-face { font-family: 'Comfortaa'; font-weight: 400; font-style: normal; src: url('${fuentes.regular}') format('woff2'); }
@font-face { font-family: 'Comfortaa'; font-weight: 700; font-style: normal; src: url('${fuentes.negrita}') format('woff2'); }
@page { size: A4 landscape; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.hoja { width: 297mm; height: 210mm; padding: 8mm 13mm 7mm; display: flex; flex-direction: column; gap: 11pt; overflow: hidden; font-family: Arial, Helvetica, sans-serif; color: #1f2933; page-break-after: always; break-after: page; }
.hoja:last-child { page-break-after: auto; break-after: auto; }
.comfortaa { font-family: 'Comfortaa', Arial, sans-serif; }

.encabezado { display: grid; grid-template-columns: 100pt 1fr 100pt; align-items: center; gap: 16pt; padding-bottom: 8pt; border-bottom: 1.5pt solid ${AZUL}; }
.encabezado img { width: 100pt; height: 92pt; object-fit: contain; }
.titulos { text-align: center; }
.institucion { font-size: 24pt; letter-spacing: 0.2pt; color: #111; }
.documento { margin-top: 3pt; font-size: 10.5pt; font-weight: 700; letter-spacing: 3pt; text-transform: uppercase; color: #6b7280; }
.datos { display: flex; justify-content: center; gap: 8pt; margin-top: 8pt; }
.dato { display: flex; align-items: baseline; gap: 5pt; padding: 3pt 10pt; border: 0.75pt solid #d5dbe1; border-radius: 20pt; font-size: 9pt; color: #6b7280; }
.dato strong { font-size: 12pt; color: #111; }
.dato-ciclo { border-color: ${AZUL}; }
.dato-ciclo strong { color: ${AZUL}; }

.cuerpo { flex: 1; min-height: 0; display: flex; gap: 16pt; }
.cuerpo-columna { flex-direction: column; }
.cuerpo:not(.cuerpo-columna) .leyenda { flex: 1; }
.rejilla { display: grid; border: 0.75pt solid #c9d0d6; border-radius: 6pt; overflow: hidden; background: #fff; }
.cabecera { display: flex; align-items: center; justify-content: center; font-size: 11pt; font-weight: 700; color: #1f2933; border-bottom: 0.75pt solid #c9d0d6; }
.cabecera-hora { background: #f1f3f5; border-right: 0.75pt solid #c9d0d6; }
.hora { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1pt; background: #f8f9fa; border-right: 0.75pt solid #c9d0d6; border-top: 0.75pt solid #e3e7eb; }
.hora .numero { font-size: 7.5pt; font-weight: 700; color: #8a94a0; letter-spacing: 0.5pt; }
.hora .rango { font-size: 10pt; font-weight: 700; color: #1f2933; }
.vacia { border-top: 0.75pt solid #e3e7eb; border-left: 0.75pt solid #eef0f2; }
.receso { background: #f3f4f6; border-top: 0.75pt solid #e3e7eb; }
.receso-hora { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1pt; line-height: 1; background: #eef0f2; border-right: 0.75pt solid #c9d0d6; border-top: 0.75pt solid #e3e7eb; font-size: 6.5pt; font-weight: 700; color: #6b7280; white-space: nowrap; }
.receso-hora strong { font-size: 6.5pt; letter-spacing: 1pt; color: #4b5563; }
.bloque { z-index: 1; margin: 2.5pt; border-radius: 5pt; border-left: 3.5pt solid; padding: 4pt 7pt; display: flex; flex-direction: column; justify-content: center; gap: 2pt; overflow: hidden; }
.bloque .continua { font-size: 7.5pt; font-weight: 700; letter-spacing: 0.5pt; color: #6b7280; }
.bloque .materia { font-size: 10.5pt; font-weight: 700; line-height: 1.15; color: #111; }
.bloque .detalle { font-size: 8pt; color: #4b5563; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bloque .detalle strong { font-size: 7.5pt; letter-spacing: 0.5pt; color: #6b7280; }

.leyenda { border: 0.75pt solid #c9d0d6; border-radius: 6pt; overflow: hidden; align-self: flex-start; width: 100%; }
.cuerpo:not(.cuerpo-columna) .leyenda { width: auto; }
.leyenda table { width: 100%; border-collapse: collapse; font-size: 9pt; }
.leyenda th { padding: 5pt 8pt; background: #f1f3f5; text-align: left; font-family: 'Comfortaa', Arial, sans-serif; font-size: 8.5pt; font-weight: 700; color: #4b5563; }
.leyenda td { padding: 4pt 8pt; border-top: 0.75pt solid #e3e7eb; vertical-align: top; }
.leyenda .clave { font-weight: 700; color: #6b7280; white-space: nowrap; }
.leyenda .num { text-align: center; white-space: nowrap; }
.leyenda tfoot td { background: #f8f9fa; font-weight: 700; color: #4b5563; }

.pie { display: flex; justify-content: space-between; font-size: 8pt; color: #8a94a0; border-top: 0.75pt solid #e3e7eb; padding-top: 5pt; }
`;

const escapar = (texto) => String(texto ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const sinCero = (hora) => hora.replace(/^0/, '');

export function tinte(hex, cuanto) {
  const n = parseInt(hex.slice(1), 16);
  const mezcla = (c) => Math.round(c + (255 - c) * cuanto);
  return `rgb(${mezcla(n >> 16)}, ${mezcla((n >> 8) & 255)}, ${mezcla(n & 255)})`;
}

export function bloquesDe(asignaciones, horas) {
  const clase = horas.filter((h) => !h.descanso);
  const indice = new Map(clase.map((h, i) => [h.id, i]));
  const recesoAntes = (i) => horas.slice(horas.indexOf(clase[i - 1]) + 1, horas.indexOf(clase[i])).some((h) => h.descanso);
  const bloques = [];
  asignaciones.forEach((a) => {
    const porDia = new Map();
    a.bloques.forEach((b) => {
      if (!indice.has(b.hora)) return;
      porDia.set(b.dia, [...(porDia.get(b.dia) ?? []), indice.get(b.hora)].sort((x, y) => x - y));
    });
    porDia.forEach((lista, dia) => {
      lista.forEach((i) => {
        const ultimo = bloques[bloques.length - 1];
        const seguida = ultimo && ultimo.asignacion === a && ultimo.dia === dia && ultimo.hasta === i - 1;
        if (seguida && !recesoAntes(i)) ultimo.hasta = i;
        else bloques.push({ asignacion: a, dia, desde: i, hasta: i, continua: seguida });
      });
    });
  });
  return bloques;
}

function rejilla(hoja, compacta) {
  const dias = DIAS_POR_TIPO[hoja.tipo];
  const filaDe = new Map();
  const filas = ['24pt'];
  hoja.horas.forEach((h) => {
    filaDe.set(h.id, filas.length + 1);
    filas.push(h.descanso ? '18pt' : '1fr');
  });
  const clase = hoja.horas.filter((h) => !h.descanso);
  const filaClase = (i) => filaDe.get(clase[i].id);
  const col = (i) => i + 2;
  const partes = [];

  partes.push('<div class="cabecera cabecera-hora comfortaa" style="grid-row:1;grid-column:1">Hora</div>');
  dias.forEach((d, i) => {
    partes.push(`<div class="cabecera comfortaa" style="grid-row:1;grid-column:${col(i)};background:${COLORES_DIA[d].fondo};${i > 0 ? 'border-left:0.75pt solid rgba(0,0,0,0.08);' : ''}">${escapar(DIAS_SEMANA[d])}</div>`);
  });
  hoja.horas.forEach((h) => {
    const r = filaDe.get(h.id);
    const rango = `${sinCero(h.inicio)} – ${sinCero(h.fin)}`;
    if (h.descanso) {
      partes.push(`<div class="receso-hora comfortaa" style="grid-row:${r};grid-column:1"><strong>DESCANSO</strong>${rango}</div>`);
      partes.push(`<div class="receso" style="grid-row:${r};grid-column:2 / ${dias.length + 2}"></div>`);
      return;
    }
    partes.push(`<div class="hora comfortaa" style="grid-row:${r};grid-column:1"><span class="numero">${h.numero}ª HORA</span><span class="rango">${rango}</span></div>`);
    dias.forEach((_, i) => partes.push(`<div class="vacia" style="grid-row:${r};grid-column:${col(i)}"></div>`));
  });
  bloquesDe(hoja.asignaciones, hoja.horas).forEach((b) => {
    const i = dias.indexOf(b.dia);
    if (i < 0) return;
    const color = COLORES_DIA[b.dia];
    const a = b.asignacion;
    const contenido = b.continua
      ? `<span class="continua">${escapar(a.clave)} · (continúa)</span>`
      : `<span class="materia">${escapar(a.materia)}</span>
      <span class="detalle"><strong>${escapar(a.clave)}</strong>${a.docente ? ` · ${escapar(a.docente)}` : ''}</span>`;
    partes.push(`<div class="bloque" style="grid-row:${filaClase(b.desde)} / ${filaClase(b.hasta) + 1};grid-column:${col(i)};background:${tinte(color.fondo, 0.35)};border-left-color:${color.acento}">
      ${contenido}
    </div>`);
  });

  const columnas = `${compacta ? '84pt' : '74pt'} repeat(${dias.length}, 1fr)`;
  return `<div class="rejilla" style="grid-template-columns:${columnas};grid-template-rows:${filas.join(' ')};${compacta ? 'width:440pt;' : 'flex:1;'}">${partes.join('')}</div>`;
}

function leyenda(hoja) {
  const filas = hoja.asignaciones.map((a) => `<tr>
    <td class="clave">${escapar(a.clave)}</td>
    <td>${escapar(a.materia)}</td>
    <td>${escapar(a.docenteCompleto || 'Sin asignar')}</td>
    <td class="num">${a.bloques.length}</td>
  </tr>`).join('');
  return `<div class="leyenda"><table>
    <thead><tr><th>Clave</th><th>Materia</th><th>Docente</th><th class="num">Horas</th></tr></thead>
    <tbody>${filas}</tbody>
    <tfoot><tr><td></td><td colspan="2">Total de horas por semana</td><td class="num">${hoja.asignaciones.reduce((n, a) => n + a.bloques.length, 0)}</td></tr></tfoot>
  </table></div>`;
}

function hoja(datos, comunes) {
  const compacta = datos.tipo === 'sabado';
  return `<section class="hoja">
  <header class="encabezado">
    <img src="${comunes.logoIzquierdo}" alt="">
    <div class="titulos">
      <div class="institucion">${escapar(comunes.institucion)}</div>
      <div class="documento comfortaa">Horario escolar</div>
      <div class="datos">
        <span class="dato">Grupo <strong>${escapar(datos.grupo)}</strong></span>
        <span class="dato">Modalidad <strong>${escapar(datos.modalidad)}</strong></span>
        <span class="dato dato-ciclo">Ciclo escolar <strong>${escapar(comunes.ciclo)}</strong></span>
      </div>
    </div>
    <img src="${comunes.logoDerecho}" alt="">
  </header>
  <div class="cuerpo${compacta ? '' : ' cuerpo-columna'}">
    ${rejilla(datos, compacta)}
    ${leyenda(datos)}
  </div>
  <footer class="pie">
    <span>${escapar([comunes.plantel, comunes.municipio].filter(Boolean).join(' · '))}</span>
    <span>${escapar(`Emitido el ${comunes.fecha}`)}</span>
  </footer>
</section>`;
}

export function tieneDisenoHorario(tipo) {
  return tipo in DIAS_POR_TIPO;
}

export function documentoHorarios({ titulo, fuentes, hojas, ...comunes }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${escapar(titulo)}</title>
<style>${ESTILOS(fuentes)}</style>
</head>
<body>
${hojas.map((h) => hoja(h, comunes)).join('\n')}
</body>
</html>`;
}
