export function imprimirDocumento(ventana) {
  if (!ventana) return;
  const anterior = document.title;
  const titulo = ventana.document.title;
  if (titulo) document.title = titulo;
  ventana.addEventListener('afterprint', () => { document.title = anterior; }, { once: true });
  ventana.print();
}
