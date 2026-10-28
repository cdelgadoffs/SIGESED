export function normalizarTexto(texto = '') {
  return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function capitalizarPalabras(texto) {
  return texto
    .toLocaleLowerCase('es-MX')
    .replace(/(^|[\s-])(\p{L})/gu, (_, separador, letra) => separador + letra.toLocaleUpperCase('es-MX'));
}

export function coincideBusqueda(termino, valores) {
  const buscado = normalizarTexto(termino);
  if (!buscado) return true;
  return valores.some((v) => normalizarTexto(v).includes(buscado));
}
