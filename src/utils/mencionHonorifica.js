import { fechaLarga } from './fechas.js';

function escapar(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fechaConA(iso) {
  return fechaLarga(iso).replace(/^[^,]+,\s*/, '');
}

const AZUL = '#1f3a5f';
const ORO = '#c9a24a';

const ESTILOS = `
@page { size: letter; margin: 10mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #fff; }
body { font-family: 'Times New Roman', Times, Georgia, serif; color: #222; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.hoja { position: relative; width: 195.9mm; height: 258.4mm; border: 2.6mm solid ${AZUL}; padding: 3mm; break-after: page; }
.hoja:last-child { break-after: auto; }
.filete { position: relative; height: 100%; border: 0.5mm solid ${ORO}; display: flex; flex-direction: column; align-items: center; padding: 15mm 20mm 0; text-align: center; overflow: hidden; }
.agua { position: absolute; top: 47%; left: 50%; width: 150mm; height: 150mm; transform: translate(-50%, -50%); object-fit: contain; opacity: 0.08; }
.contenido { position: relative; width: 100%; display: flex; flex-direction: column; align-items: center; height: 100%; }
.institucion { font-size: 25px; font-weight: 700; letter-spacing: 0.1em; white-space: nowrap; color: ${AZUL}; text-transform: uppercase; }
.adorno { margin-top: 3.5mm; display: flex; align-items: center; gap: 3mm; }
.adorno .linea { width: 62mm; height: 3px; border-top: 1px solid ${ORO}; border-bottom: 1px solid ${AZUL}; }
.adorno .rombo { width: 7px; height: 7px; background: ${ORO}; transform: rotate(45deg); }
h1 { margin-top: 17mm; font-size: 42px; font-weight: 700; color: ${AZUL}; letter-spacing: 0.01em; }
h2 { margin-top: 1mm; font-size: 29px; font-weight: 700; color: ${AZUL}; }
.otorga { margin-top: 20mm; font-size: 16px; color: #333; }
.nombre { margin-top: 9mm; width: 100%; padding-bottom: 3mm; font-size: 33px; font-style: italic; font-weight: 700; color: ${AZUL}; border-bottom: 1px solid ${ORO}; }
.parrafo { margin-top: 11mm; font-size: 16.5px; line-height: 1.85; text-align: justify; color: #222; }
.parrafo + .parrafo { margin-top: 7mm; }
.lugar { margin-top: 12mm; font-size: 16px; color: #222; }
.firma { margin-top: auto; margin-bottom: 15mm; width: 85mm; }
.firma .linea { border-top: 1px solid #222; margin-bottom: 3mm; }
.firma .persona { font-size: 15.5px; font-weight: 700; min-height: 18px; }
.firma .cargo { font-size: 15px; margin-top: 1mm; }
`;

function hoja(m, comunes) {
  return `
    <section class="hoja">
      <div class="filete">
        <img class="agua" src="${comunes.logo}" alt="">
        <div class="contenido">
          <div class="institucion">${escapar(comunes.institucion)}</div>
          <div class="adorno"><div class="linea"></div><div class="rombo"></div><div class="linea"></div></div>
          <h1>CONSTANCIA</h1>
          <h2>DE MENCIÓN HONORÍFICA</h2>
          <div class="otorga">El ${escapar(comunes.institucion)} otorga la presente a:</div>
          <div class="nombre">${escapar(m.nombre)}</div>
          <p class="parrafo">por haber obtenido un desempeño académico sobresaliente durante su proceso de <strong>titulación</strong>, destacándose por su esfuerzo, dedicación y compromiso con su formación profesional.</p>
          <p class="parrafo">Se extiende la presente <strong>Mención Honorífica</strong> como reconocimiento a su excelencia y como estímulo para continuar su camino con el mismo entusiasmo y disciplina.</p>
          <div class="lugar">${escapar([comunes.lugar, `a ${fechaConA(m.fecha)}`].filter(Boolean).join(', '))}.</div>
          <div class="firma"><div class="linea"></div><div class="persona">${escapar(comunes.firma.nombre)}</div><div class="cargo">${escapar(comunes.firma.cargo)}</div></div>
        </div>
      </div>
    </section>`;
}

export function documentoMencion({ titulo, menciones, ...comunes }) {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${escapar(titulo)}</title><style>${ESTILOS}</style></head><body>${menciones.map((m) => hoja(m, comunes)).join('')}</body></html>`;
}
