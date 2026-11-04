const TEXTO_EJEMPLO = 'Texto de ejemplo. El Administrador TI podrá cambiarlo desde el editor del sitio.';

export const PAGINAS_SITIO = {
  'publico:inicio': {
    ruta: '/',
    titulo: 'Inicio',
    descripcion: 'Sitio informativo del instituto: oferta educativa, admisiones y avisos.',
    bloques: [
      {
        tipo: 'portada',
        etiqueta: 'Bienvenidos',
        subtitulo: 'Formamos a las generaciones del futuro con la enseñanza del presente.',
        icono: 'ri-graduation-cap-line',
        acciones: [
          { texto: 'Conoce la oferta educativa', destino: 'publico:oferta', principal: true },
          { texto: 'Admisiones', destino: 'publico:admisiones' },
        ],
      },
      {
        tipo: 'tarjetas',
        titulo: '¿Por qué elegirnos?',
        descripcion: TEXTO_EJEMPLO,
        fondo: 'blanco',
        tarjetas: [
          { icono: 'ri-user-star-line', titulo: 'Docentes calificados', texto: TEXTO_EJEMPLO },
          { icono: 'ri-calendar-schedule-line', titulo: 'Modalidades flexibles', texto: TEXTO_EJEMPLO },
          { icono: 'ri-award-line', titulo: 'Validez oficial', texto: TEXTO_EJEMPLO },
        ],
      },
      {
        tipo: 'tarjetas',
        titulo: 'Explora',
        tarjetas: [
          { icono: 'ri-book-open-line', titulo: 'Oferta educativa', texto: 'Programas, modalidades y plan de estudios.', destino: 'publico:oferta' },
          { icono: 'ri-megaphone-line', titulo: 'Avisos', texto: 'Noticias y comunicados del instituto.', destino: 'publico:avisos' },
          { icono: 'ri-image-line', titulo: 'Galería', texto: 'Nuestra vida escolar en imágenes.', destino: 'publico:galeria' },
        ],
      },
    ],
  },
  'publico:nosotros': {
    ruta: '/nosotros',
    titulo: 'Nosotros',
    descripcion: 'Misión, visión y valores del instituto.',
    bloques: [
      { tipo: 'portada', compacta: true, titulo: 'Nosotros', subtitulo: 'Conoce quiénes somos y lo que nos mueve.', icono: 'ri-building-4-line' },
      {
        tipo: 'tarjetas',
        fondo: 'blanco',
        tarjetas: [
          { icono: 'ri-focus-3-line', titulo: 'Misión', texto: TEXTO_EJEMPLO },
          { icono: 'ri-eye-line', titulo: 'Visión', texto: TEXTO_EJEMPLO },
          { icono: 'ri-heart-3-line', titulo: 'Valores', texto: TEXTO_EJEMPLO },
        ],
      },
      {
        tipo: 'tarjetas',
        titulo: 'Nuestra historia',
        columnas: 2,
        tarjetas: [
          { icono: 'ri-history-line', titulo: 'Origen', texto: TEXTO_EJEMPLO },
          { icono: 'ri-team-line', titulo: 'Comunidad', texto: TEXTO_EJEMPLO },
        ],
      },
    ],
  },
  'publico:oferta': {
    ruta: '/oferta',
    titulo: 'Oferta educativa',
    descripcion: 'Programas educativos, modalidades y plan de estudios del instituto.',
    bloques: [
      { tipo: 'portada', compacta: true, titulo: 'Oferta educativa', subtitulo: 'Elige el programa y la modalidad que se adapten a ti.', icono: 'ri-book-open-line' },
      { tipo: 'oferta', titulo: 'Programas educativos', descripcion: 'Todos los programas se cursan en 9 cuatrimestres de 2 módulos.', fondo: 'blanco' },
    ],
  },
  'publico:avisos': {
    ruta: '/avisos',
    titulo: 'Avisos',
    descripcion: 'Noticias y comunicados del instituto.',
    bloques: [
      { tipo: 'portada', compacta: true, titulo: 'Avisos', subtitulo: 'Mantente al día con lo que pasa en el instituto.', icono: 'ri-megaphone-line' },
      {
        tipo: 'tarjetas',
        fondo: 'blanco',
        tarjetas: [
          { icono: 'ri-notification-3-line', titulo: 'Aviso de ejemplo', detalle: 'Próximamente', texto: TEXTO_EJEMPLO },
          { icono: 'ri-calendar-event-line', titulo: 'Evento de ejemplo', detalle: 'Próximamente', texto: TEXTO_EJEMPLO },
          { icono: 'ri-newspaper-line', titulo: 'Noticia de ejemplo', detalle: 'Próximamente', texto: TEXTO_EJEMPLO },
        ],
      },
    ],
  },
  'publico:galeria': {
    ruta: '/galeria',
    titulo: 'Galería',
    descripcion: 'La vida escolar del instituto en imágenes.',
    bloques: [
      { tipo: 'portada', compacta: true, titulo: 'Galería', subtitulo: 'Momentos de nuestra comunidad escolar.', icono: 'ri-image-line' },
      {
        tipo: 'tarjetas',
        fondo: 'blanco',
        tarjetas: [
          { icono: 'ri-image-2-line', titulo: 'Ceremonias', texto: 'Las fotografías se agregarán desde el editor del sitio.' },
          { icono: 'ri-camera-line', titulo: 'Actividades', texto: 'Las fotografías se agregarán desde el editor del sitio.' },
          { icono: 'ri-landscape-line', titulo: 'Instalaciones', texto: 'Las fotografías se agregarán desde el editor del sitio.' },
        ],
      },
    ],
  },
  'publico:admisiones': {
    ruta: '/admisiones',
    titulo: 'Admisiones',
    descripcion: 'Requisitos y pasos para inscribirte en el instituto.',
    bloques: [
      { tipo: 'portada', compacta: true, titulo: 'Admisiones', subtitulo: 'Tu lugar en el instituto empieza aquí.', icono: 'ri-door-open-line' },
      {
        tipo: 'tarjetas',
        titulo: 'Pasos para inscribirte',
        fondo: 'blanco',
        columnas: 4,
        numerada: true,
        tarjetas: [
          { titulo: 'Infórmate', texto: TEXTO_EJEMPLO },
          { titulo: 'Reúne tus documentos', texto: TEXTO_EJEMPLO },
          { titulo: 'Acude al plantel', texto: TEXTO_EJEMPLO },
          { titulo: 'Inicia tus clases', texto: TEXTO_EJEMPLO },
        ],
      },
      {
        tipo: 'tarjetas',
        titulo: 'Requisitos',
        columnas: 2,
        tarjetas: [
          { icono: 'ri-file-list-3-line', titulo: 'Documentación', texto: TEXTO_EJEMPLO },
          { icono: 'ri-bank-card-line', titulo: 'Cuotas', texto: TEXTO_EJEMPLO },
        ],
      },
    ],
  },
};

export function vistaDeRuta(ruta) {
  return Object.entries(PAGINAS_SITIO).find(([, p]) => p.ruta === ruta)?.[0] ?? null;
}

export function esVistaPublica(vista) {
  return vista in PAGINAS_SITIO;
}
