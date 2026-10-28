import { useEffect, useRef, useState } from 'react';

export function useScrollbarPersonalizada() {
  const contenedorRef = useRef(null);
  const [thumb, setThumb] = useState({ alto: 0, top: 0, visible: false });

  function recalcular() {
    const el = contenedorRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight) {
      setThumb({ alto: 0, top: 0, visible: false });
      return;
    }
    const alto = Math.max((clientHeight / scrollHeight) * clientHeight, 24);
    const recorrido = clientHeight - alto;
    const top = (scrollTop / (scrollHeight - clientHeight)) * recorrido;
    setThumb({ alto, top, visible: true });
  }

  useEffect(() => {
    recalcular();
    const el = contenedorRef.current;
    if (!el) return;

    const observadores = [];
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(recalcular);
      ro.observe(el);
      observadores.push(ro);
    }
    if (typeof MutationObserver !== 'undefined') {
      const mo = new MutationObserver(recalcular);
      mo.observe(el, { childList: true, subtree: true, characterData: true });
      observadores.push(mo);
    }
    return () => observadores.forEach((o) => o.disconnect());
  }, []);

  function onArrastrarThumb(e) {
    e.preventDefault();
    const el = contenedorRef.current;
    if (!el) return;
    const inicioY = e.clientY;
    const inicioScrollTop = el.scrollTop;
    const { scrollHeight, clientHeight } = el;
    const recorridoThumb = clientHeight - Math.max((clientHeight / scrollHeight) * clientHeight, 24);

    function mover(ev) {
      const delta = ev.clientY - inicioY;
      const factor = (scrollHeight - clientHeight) / (recorridoThumb || 1);
      el.scrollTop = inicioScrollTop + delta * factor;
    }
    function soltar() {
      document.removeEventListener('mousemove', mover);
      document.removeEventListener('mouseup', soltar);
    }
    document.addEventListener('mousemove', mover);
    document.addEventListener('mouseup', soltar);
  }

  return { contenedorRef, thumb, onScroll: recalcular, onArrastrarThumb };
}
