import { useScrollbarPersonalizada } from '../../hooks/useScrollbarPersonalizada.js';
import '../../styles/base/PaginaSitio.css';

export default function PaginaSitio({ navegacion, pie, children }) {
  const { contenedorRef, thumb, onScroll, onArrastrarThumb } = useScrollbarPersonalizada();
  return (
    <div className="base-pagina-sitio">
      {navegacion}
      <div className="base-pagina-sitio-scroll" ref={contenedorRef} onScroll={onScroll}>
        <main className="base-pagina-sitio-contenido">{children}</main>
        {pie}
      </div>
      {thumb.visible && (
        <div className="base-pagina-sitio-thumb" style={{ height: thumb.alto, top: thumb.top }} onMouseDown={onArrastrarThumb} />
      )}
    </div>
  );
}
