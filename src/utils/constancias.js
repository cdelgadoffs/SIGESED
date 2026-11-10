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
  if (!semana) return 'en la semana de cierre del ciclo';
  if (semana.inicio === semana.fin) return `el ${sinDia(semana.inicio)}`;
  return `del ${sinDia(semana.inicio)} al ${sinDia(semana.fin)}`;
}

const AZUL = '#1f3a64';
const ORO = '#b08d3c';

const ESTILOS = `
@page { size: letter landscape; margin: 9mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #fff; }
body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.hoja { position: relative; width: 261mm; height: 197mm; padding: 7mm; break-after: page; overflow: hidden; }
.hoja:last-child { break-after: auto; }
.marco { position: absolute; inset: 0; border: 3px solid ${AZUL}; }
.marco::after { content: ''; position: absolute; inset: 5px; border: 1px solid ${ORO}; }
.esquina { position: absolute; width: 22mm; height: 22mm; border: 2px solid ${ORO}; }
.esquina.a { top: 3.5mm; left: 3.5mm; border-right: none; border-bottom: none; }
.esquina.b { top: 3.5mm; right: 3.5mm; border-left: none; border-bottom: none; }
.esquina.c { bottom: 3.5mm; left: 3.5mm; border-right: none; border-top: none; }
.esquina.d { bottom: 3.5mm; right: 3.5mm; border-left: none; border-top: none; }
.agua { position: absolute; top: 50%; left: 50%; width: 120mm; height: 120mm; transform: translate(-50%, -50%); object-fit: contain; opacity: 0.06; }
.contenido { position: relative; height: 100%; display: flex; flex-direction: column; align-items: center; padding: 6mm 16mm 0; text-align: center; }
.encabezado { width: 100%; display: grid; grid-template-columns: 28mm 1fr 28mm; align-items: center; }
.encabezado img { height: 24mm; width: 28mm; object-fit: contain; }
.institucion { font-size: 15px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: ${AZUL}; }
.plantel { margin-top: 3px; font-size: 11.5px; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280; }
h1 { margin-top: 11mm; font-family: Georgia, 'Times New Roman', serif; font-size: 44px; font-weight: 400; letter-spacing: 0.42em; color: ${AZUL}; padding-left: 0.42em; }
.tipo { margin-top: 2mm; font-size: 10.5px; letter-spacing: 0.24em; text-transform: uppercase; color: ${ORO}; }
.otorga { margin-top: 10mm; font-size: 14px; font-style: italic; color: #4b5563; }
.nombre { margin-top: 4mm; padding: 0 10mm 2.5mm; min-width: 60%; font-family: Georgia, 'Times New Roman', serif; font-size: 34px; font-weight: 700; color: #111827; border-bottom: 1.5px solid ${ORO}; }
.matricula { margin-top: 1.5mm; font-size: 10.5px; letter-spacing: 0.12em; color: #6b7280; }
.cuerpo { margin-top: 8mm; max-width: 205mm; font-size: 15px; line-height: 1.75; color: #1f2937; }
.cuerpo strong { color: ${AZUL}; }
.lugar { margin-top: 6mm; font-size: 12.5px; color: #4b5563; }
.pie { margin-top: auto; width: 100%; display: grid; grid-template-columns: 1fr 34mm 1fr; align-items: end; gap: 12mm; padding: 0 30mm 9mm; }
.firma .linea { border-top: 1.2px solid #111827; margin-bottom: 4px; }
.firma .persona { font-size: 11.5px; font-weight: 700; min-height: 14px; }
.firma .cargo { font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: #6b7280; margin-top: 2px; }
.sello { width: 34mm; height: 34mm; }
.verificacion { position: absolute; left: 9mm; bottom: 8mm; display: flex; align-items: flex-end; gap: 3mm; text-align: left; }
.verificacion img { width: 21mm; height: 21mm; }
.verificacion .folio { font-size: 9px; color: #6b7280; line-height: 1.4; }
.verificacion .folio strong { display: block; font-size: 11px; letter-spacing: 0.06em; color: ${AZUL}; }
`;

function sello(texto) {
  const t = escapar(String(texto ?? '').toUpperCase());
  return `<svg class="sello" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <defs><path id="arco" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs>
    <circle cx="60" cy="60" r="57" fill="none" stroke="${AZUL}" stroke-width="2.5" opacity="0.55"/>
    <circle cx="60" cy="60" r="35" fill="none" stroke="${AZUL}" stroke-width="1.2" opacity="0.55"/>
    <text font-family="Arial" font-size="9.5" font-weight="700" fill="${AZUL}" opacity="0.6"><textPath href="#arco" textLength="272" lengthAdjust="spacingAndGlyphs">${t} · ${t} ·</textPath></text>
    <text x="60" y="58" text-anchor="middle" font-family="Georgia" font-size="11" fill="${AZUL}" opacity="0.6">SELLO</text>
    <text x="60" y="72" text-anchor="middle" font-family="Georgia" font-size="16" fill="${ORO}">★</text>
  </svg>`;
}

function hoja(c, comunes) {
  const [firma1, firma2] = comunes.firmas.map((f) => `
    <div class="firma"><div class="linea"></div><div class="persona">${escapar(f.nombre)}</div><div class="cargo">${escapar(f.etiqueta)}</div></div>`);
  return `
    <section class="hoja">
      <div class="marco"></div>
      <div class="esquina a"></div><div class="esquina b"></div><div class="esquina c"></div><div class="esquina d"></div>
      <img class="agua" src="${comunes.logoIzquierdo}" alt="">
      <div class="contenido">
        <div class="encabezado">
          <img src="${comunes.logoIzquierdo}" alt="">
          <div><div class="institucion">${escapar(comunes.institucion)}</div><div class="plantel">${escapar(comunes.plantel)}</div></div>
          <img src="${comunes.logoDerecho}" alt="">
        </div>
        <h1>CONSTANCIA</h1>
        <div class="tipo">${escapar(c.tipo)}</div>
        <div class="otorga">otorga la presente a</div>
        <div class="nombre">${escapar(c.nombre)}</div>
        ${c.matricula ? `<div class="matricula">MATRÍCULA ${escapar(c.matricula)}</div>` : ''}
        <div class="cuerpo">${c.cuerpo}</div>
        <div class="lugar">${escapar([comunes.municipio, comunes.fecha].filter(Boolean).join(', '))}.</div>
        <div class="pie">${firma1 ?? '<div></div>'}${sello(comunes.plantel || comunes.institucion)}${firma2 ?? '<div></div>'}</div>
      </div>
      ${c.folio ? `<div class="verificacion">${c.qr ? `<img src="${c.qr}" alt="">` : ''}<div class="folio">Folio<strong>${escapar(c.folio)}</strong>Verificable con código QR</div></div>` : ''}
    </section>`;
}

function datosCurso({ curso, materia, periodo, horario }) {
  return { curso: `<strong>«${escapar(curso)}»</strong>`, materia: materia ? `<strong>${escapar(materia)}</strong>` : '', cuando: `${escapar(periodo)}, de ${escapar(horario)}, con una duración de ${HORAS_CURSO} horas` };
}

export function cuerpoAlumno({ docente, voluntario, ...resto }) {
  const d = datosCurso(resto);
  const imparte = docente ? `, impartido por ${escapar(docente)}` : '';
  if (voluntario || !d.materia) {
    return `por su participación y acreditación en el curso extracurricular ${d.curso}${imparte}, ${d.cuando}.`;
  }
  return `por haber acreditado el curso extracurricular ${d.curso}, para la recuperación de la materia ${d.materia}${imparte}, ${d.cuando}.`;
}

export function cuerpoDocente({ alumnos, ...resto }) {
  const d = datosCurso(resto);
  const recupera = d.materia ? `, para la recuperación de la materia ${d.materia},` : '';
  return `por haber impartido el curso extracurricular ${d.curso}${recupera} ${d.cuando}, a ${alumnos} ${alumnos === 1 ? 'alumno inscrito' : 'alumnos inscritos'}.`;
}

export function documentoConstancias({ titulo, constancias, ...comunes }) {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${escapar(titulo)}</title><style>${ESTILOS}</style></head><body>${constancias.map((c) => hoja(c, comunes)).join('')}</body></html>`;
}
