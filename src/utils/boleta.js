export const LEMA = 'La enseñanza del presente para las generaciones del futuro';

const reglasHoja = (p) => `
  ${p}#boleta .lema { position: fixed; left: 0; right: 0; bottom: 8mm; margin: 0; }
  ${p}body { background: white !important; padding: 0 !important; margin: 0 !important; }
  ${p}.container { box-shadow: none !important; border-radius: 0 !important; padding: 10px !important; max-width: 100% !important; }
  ${p}#boleta { border: none !important; border-radius: 0 !important; padding: 20px 30px !important; margin: 0 !important; box-shadow: none !important; }
  ${p}#boleta .header { border-bottom: 3px double #000 !important; }
  ${p}#boleta table th { background: #eee !important; border-bottom: 2px solid #000 !important; }
  ${p}#boleta .promedio { border: 1px solid #000 !important; background: #f4f4f4 !important; }
  ${p}#boleta .firma-sello { margin-top: 120px !important; border-top: none !important; }
  ${p}#boleta .firma-sello .col .linea-firma { border-bottom: 1px solid #000 !important; }
  ${p}#boleta .obs .linea { border-bottom: 1px solid #000 !important; }
`;

export const ANCHO_HOJA = 816;
export const ALTO_HOJA = 1056;

const ESTILOS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
  background: #e9edf2;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.container {
  max-width: 1000px;
  width: 100%;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  padding: 30px 35px 35px 35px;
}
#boleta {
  font-family: 'Times New Roman', Times, serif;
  background: #ffffff;
  padding: 45px 50px 40px 50px;
  border: 2px solid #1a1a1a;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  margin-top: 6px;
}
#boleta .header-logos { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
#boleta .header-logos img {
  height: 85px;
  width: 85px;
  object-fit: contain;
  flex-shrink: 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
#boleta .header-logos .header-texto { flex: 1; }
#boleta .lema { margin-top: 70px; text-align: center; font-style: italic; color: #6b7280; font-size: 15px; }
#boleta .header { text-align: center; border-bottom: 3px double #1a1a1a; padding-bottom: 16px; margin-bottom: 24px; }
#boleta .header h1 { font-size: 23px; font-weight: 700; letter-spacing: 1px; white-space: nowrap; color: #000000; margin: 0; text-transform: uppercase; }
#boleta .header h2 { font-size: 17px; font-weight: 400; color: #1e1e1e; margin: 2px 0 6px 0; letter-spacing: 1px; }
#boleta .header .titulo-boleta { font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 4px; color: #0b1a3a; margin-top: 6px; }
#boleta .header .periodo {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  border-top: 1px solid #aaa;
  display: inline-block;
  padding-top: 6px;
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 4px;
}
#boleta .alumno-nombre {
  font-size: 19px;
  font-weight: 600;
  padding: 14px 20px;
  background: #f5f7fa;
  border: 1px solid #b0b8c4;
  border-radius: 4px;
  margin-bottom: 22px;
  color: #0b1a3a;
}
#boleta .alumno-nombre span { font-weight: 400; color: #000; }
#boleta table { width: 100%; border-collapse: collapse; margin: 6px 0 18px 0; font-size: 16px; }
#boleta table th {
  text-align: left;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: #eef2f6;
  color: #1a1a1a;
  border-bottom: 2px solid #000000;
  padding: 10px 10px;
  font-weight: 700;
}
#boleta table td { padding: 10px 10px; border-bottom: 1px solid #d8dde5; }
#boleta table tr:last-child td { border-bottom: none; }
#boleta table td:last-child { text-align: center; font-weight: 700; font-size: 17px; }
#boleta table td.reprobada { color: #c62828; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
#boleta .promedio {
  background: #f4f7fc;
  padding: 14px 20px;
  border-radius: 4px;
  border: 1px solid #b0b8c4;
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 19px;
  font-weight: 700;
}
#boleta .promedio .valor { color: #0b1a3a; font-size: 22px; background: white; padding: 2px 20px; border-radius: 4px; border: 1px solid #a0aaba; }
#boleta .obs { margin-top: 52px; padding-top: 14px; border-top: 1px solid #b0b8c4; }
#boleta .obs label { font-weight: 700; font-size: 15px; color: #1a1a1a; }
#boleta .obs .linea { border-bottom: 1px solid #000000; width: 100%; height: 32px; margin-top: 2px; }
#boleta .obs .obs-texto { white-space: pre-wrap; font-size: 15px; line-height: 1.6; margin-top: 6px; padding-bottom: 6px; border-bottom: 1px solid #000000; }
#boleta .firma-sello { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 120px; padding-top: 0px; }
#boleta .firma-sello .col { text-align: center; width: 45%; }
#boleta .firma-sello .col .linea-firma { border-bottom: 1px solid #000000; height: 32px; margin-bottom: 2px; }
#boleta .firma-sello .col .etiqueta { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #1a1a1a; }
#boleta .firma-sello .col .sub { font-size: 13px; font-weight: 500; color: #000; margin-top: 2px; text-transform: uppercase; }
@page { size: letter; margin: 1cm; }
@media print { ${reglasHoja('')} }
@media screen {
  ${reglasHoja('html.hoja ')}
  html.hoja body { padding: 1cm !important; }
  html.hoja #boleta .lema { left: 1cm; right: 1cm; bottom: calc(8mm + 1cm); }
}
@media (max-width: 700px) {
  .container { padding: 12px; }
  #boleta { padding: 18px 14px !important; }
  #boleta .header h1 { font-size: 20px; }
  #boleta .header .titulo-boleta { font-size: 16px; letter-spacing: 2px; }
  #boleta .firma-sello { flex-direction: column; align-items: center; gap: 30px; margin-top: 80px; }
  #boleta .firma-sello .col { width: 100%; }
}
`;

function escapar(texto = '') {
  return String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const TRATAMIENTO = { mujer: 'Alumna', hombre: 'Alumno' };

export function tituloBoleta(alumno, ciclo) {
  return `${alumno} - ${ciclo}`;
}

export function documentoBoleta({ institucion, plantel, ciclo, alumno, genero, filas, promedio, observaciones, logoIzquierdo, logoDerecho, hoja = false }) {
  const renglones = filas.map((f) => `<tr><td>${escapar(f.materia)}</td><td${f.reprobada ? ' class="reprobada"' : ''}>${escapar(f.calificacion)}</td></tr>`).join('');
  const obs = (observaciones || '').trim();
  return `<!DOCTYPE html>
<html lang="es"${hoja ? ' class="hoja"' : ''}>
<head>
<meta charset="UTF-8" />
<title>${escapar(tituloBoleta(alumno, ciclo))}</title>
<style>${ESTILOS}</style>
</head>
<body>
<div class="container">
<div id="boleta">
  <div class="header header-logos">
    <img src="${escapar(logoIzquierdo)}" alt="Logo ICOM" />
    <div class="header-texto">
      <h1>${escapar(institucion)}</h1>
      <h2>${escapar(plantel)}</h2>
      <div class="titulo-boleta">Boleta de Calificaciones</div>
      <div class="periodo">Ciclo Escolar ${escapar(ciclo)}</div>
    </div>
    <img src="${escapar(logoDerecho)}" alt="Logo 55 aniversario" />
  </div>
  <div class="alumno-nombre">${TRATAMIENTO[genero] ?? 'Alumno(a)'}: <span>${escapar(alumno)}</span></div>
  <table>
    <thead><tr><th>Materia</th><th style="text-align:center;">Calificación</th></tr></thead>
    <tbody>${renglones}</tbody>
  </table>
  <div class="promedio"><span>PROMEDIO GENERAL</span><span class="valor">${promedio.toFixed(2)}</span></div>
  <div class="obs">
    <label>Observaciones:</label>
    ${obs ? `<div class="obs-texto">${escapar(obs)}</div>` : '<div class="linea"></div>'}
  </div>
  <div class="firma-sello">
    <div class="col"><div class="linea-firma"></div><div class="etiqueta">Firma de conformidad</div><div class="sub">${escapar(alumno)}</div></div>
    <div class="col"><div class="linea-firma"></div><div class="etiqueta">Sello de la Institución</div><div class="sub">${escapar(institucion)}</div></div>
  </div>
  <div class="lema">${escapar(LEMA)}</div>
</div>
</div>
</body>
</html>`;
}
