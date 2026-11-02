import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useScrollbarPersonalizada } from '../../hooks/useScrollbarPersonalizada.js';
import '../../styles/base/ListaExpandible.css';

const SEPARACION = 4;
const MARGEN_VENTANA = 8;
const RELLENO_MENU = 10;

function Menu({ menuRef, ancla, opciones, valorActual, onElegir }) {
  const { contenedorRef, thumb, onScroll, onArrastrarThumb } = useScrollbarPersonalizada();

  useLayoutEffect(() => {
    const menu = menuRef.current;
    const lista = contenedorRef.current;
    if (!menu || !lista) return;
    const alto = lista.scrollHeight + RELLENO_MENU;
    const abajo = window.innerHeight - ancla.bottom - SEPARACION - MARGEN_VENTANA;
    const arriba = ancla.top - SEPARACION - MARGEN_VENTANA;
    const haciaArriba = alto > abajo && arriba > abajo;
    menu.style.top = haciaArriba ? '' : `${ancla.bottom + SEPARACION}px`;
    menu.style.bottom = haciaArriba ? `${window.innerHeight - ancla.top + SEPARACION}px` : '';
    lista.style.maxHeight = `${Math.max((haciaArriba ? arriba : abajo) - RELLENO_MENU, 60)}px`;
  }, [menuRef, contenedorRef, ancla]);

  return (
    <div ref={menuRef} className="base-lista-expandible-menu" style={{ left: ancla.left, minWidth: ancla.width }}>
      <div ref={contenedorRef} className="base-lista-expandible-opciones" onScroll={onScroll}>
        {opciones.map((op) => (
          <div
            key={op.id}
            className={'base-lista-expandible-item' + (op.id === valorActual ? ' base-lista-expandible-item-activo' : '')}
            onClick={() => onElegir(op.id)}
          >
            {op.label}
          </div>
        ))}
      </div>
      {thumb.visible && (
        <div
          className="base-lista-expandible-thumb"
          style={{ height: thumb.alto, top: thumb.top + RELLENO_MENU / 2 }}
          onMouseDown={onArrastrarThumb}
        />
      )}
    </div>
  );
}

export default function ListaExpandible({ valorActual, etiquetaActual, opciones, onSeleccionar }) {
  const [abierto, setAbierto] = useState(false);
  const [ancla, setAncla] = useState(null);
  const botonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function manejarClickFuera(e) {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        botonRef.current && !botonRef.current.contains(e.target)
      ) setAbierto(false);
    }
    document.addEventListener('mousedown', manejarClickFuera);
    return () => document.removeEventListener('mousedown', manejarClickFuera);
  }, []);

  useEffect(() => {
    if (!abierto) return;
    function cerrarPorScrollOResize(e) {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setAbierto(false);
    }
    window.addEventListener('scroll', cerrarPorScrollOResize, true);
    window.addEventListener('resize', cerrarPorScrollOResize);
    return () => {
      window.removeEventListener('scroll', cerrarPorScrollOResize, true);
      window.removeEventListener('resize', cerrarPorScrollOResize);
    };
  }, [abierto]);

  function toggle() {
    if (!abierto && botonRef.current) {
      const rect = botonRef.current.getBoundingClientRect();
      setAncla({ top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width });
    }
    setAbierto((v) => !v);
  }

  return (
    <>
      <div
        ref={botonRef}
        className={'base-lista-expandible-toggle' + (abierto ? ' base-lista-expandible-toggle-abierto' : '')}
        onClick={toggle}
      >
        {etiquetaActual}
        <span className="base-lista-expandible-chevron">▾</span>
      </div>
      {abierto && ancla && (
        <Menu
          menuRef={menuRef}
          ancla={ancla}
          opciones={opciones}
          valorActual={valorActual}
          onElegir={(id) => { onSeleccionar(id); setAbierto(false); }}
        />
      )}
    </>
  );
}
