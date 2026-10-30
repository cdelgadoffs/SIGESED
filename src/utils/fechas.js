export const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const FORMATO_CORTO = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

function aFecha(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}

export function diaDeSemana(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return null;
  return aFecha(iso).getUTCDay();
}

const FORMATO_LARGO = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function fechaLarga(iso) {
  return iso ? FORMATO_LARGO.format(aFecha(iso)) : '';
}

export function fechaCorta(iso) {
  return iso ? FORMATO_CORTO.format(aFecha(iso)) : '';
}

export const ESTADOS_CICLO = {
  'en-curso': { texto: 'En curso', tono: 'azul', cinta: 'proxima' },
  concluido: { texto: 'Concluido', tono: 'verde', cinta: 'celebrada' },
  proximo: { texto: 'Próximo', tono: 'azul', cinta: 'proxima' },
  'sin-configurar': { texto: 'Sin configurar', tono: 'gris', cinta: 'pendiente' },
};

export function hoyLocal() {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`;
}
