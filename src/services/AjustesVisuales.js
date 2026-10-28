const CLAVE = 'ajustesVisuales';

export function leerAjustesVisuales() {
  try {
    const valor = JSON.parse(localStorage.getItem(CLAVE));
    return valor && typeof valor === 'object' && !Array.isArray(valor) ? valor : {};
  } catch {
    return {};
  }
}

export function guardarAjustesVisuales(cambios) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ ...leerAjustesVisuales(), ...cambios }));
  } catch {
    return;
  }
}
