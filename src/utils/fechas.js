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

export function fechaCorta(iso) {
  return iso ? FORMATO_CORTO.format(aFecha(iso)) : '';
}

export const ESTADOS_CICLO = {
  'en-curso': { texto: 'En curso', tono: 'azul', cinta: 'proxima' },
  concluido: { texto: 'Concluido', tono: 'verde', cinta: 'celebrada' },
  proximo: { texto: 'Próximo', tono: 'azul', cinta: 'proxima' },
  'sin-configurar': { texto: 'Sin configurar', tono: 'gris', cinta: 'pendiente' },
};
