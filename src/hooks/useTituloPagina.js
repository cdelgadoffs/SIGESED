import { useEffect } from 'react';

export function useTituloPagina(titulo, descripcion) {
  useEffect(() => {
    const anterior = document.title;
    document.title = titulo;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', descripcion ?? '');
    return () => { document.title = anterior; };
  }, [titulo, descripcion]);
}
