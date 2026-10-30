export function normalizarTexto(texto = '') {
  return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function capitalizarPalabras(texto) {
  return texto
    .toLocaleLowerCase('es-MX')
    .replace(/(^|[\s-])(\p{L})/gu, (_, separador, letra) => separador + letra.toLocaleUpperCase('es-MX'));
}

export function coincideBusqueda(termino, valores) {
  const palabras = normalizarTexto(termino).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return true;
  const texto = valores.map((v) => normalizarTexto(v)).join(' ');
  return palabras.every((p) => texto.includes(p));
}
