const CLAVE = 'rolesActivos';

export function leerRolesActivos() {
  try {
    const valor = JSON.parse(localStorage.getItem(CLAVE));
    return valor && typeof valor === 'object' && !Array.isArray(valor) ? valor : {};
  } catch {
    return {};
  }
}

export function guardarRolesActivos(estado) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {
    return;
  }
}
