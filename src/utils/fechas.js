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

const FORMATO_DIA = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
const FORMATO_DIA_MES = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', timeZone: 'UTC' });

export function fechaDia(iso) {
  return iso ? FORMATO_DIA.format(aFecha(iso)) : '';
}

export function fechaDiaMes(iso) {
  return iso ? FORMATO_DIA_MES.format(aFecha(iso)) : '';
}

export function diasEntre(desde, hasta) {
  return Math.round((aFecha(hasta) - aFecha(desde)) / 86400000);
}

export function diasDeSemana(semana, asuetos, hoy) {
  const inicio = aFecha(semana.inicio);
  return Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date(inicio.getTime() + i * 86400000);
    const iso = fecha.toISOString().slice(0, 10);
    return { fecha: iso, dia: fecha.getUTCDate(), diaSemana: fecha.getUTCDay(), asueto: asuetos.includes(iso), hoy: iso === hoy };
  });
}
