import { useScrollbarPersonalizada } from '../../hooks/useScrollbarPersonalizada.js';
import '../../styles/base/MarcoMovil.css';

export default function MarcoMovil({ titulo, subtitulo, accion, navegacion, children }) {
  const { contenedorRef, thumb, onScroll, onArrastrarThumb } = useScrollbarPersonalizada();
  return (
    <div className="base-marco-movil">
      <header className="base-marco-movil-encabezado">
        <div className="base-marco-movil-titulos">
          <span className="base-marco-movil-titulo">{titulo}</span>
          {subtitulo && <span className="base-marco-movil-subtitulo">{subtitulo}</span>}
        </div>
        {accion}
      </header>
      <div className="base-marco-movil-cuerpo-wrap">
        <main className="base-marco-movil-cuerpo" ref={contenedorRef} onScroll={onScroll}>{children}</main>
        {thumb.visible && (
          <div className="base-marco-movil-thumb" style={{ height: thumb.alto, top: thumb.top }} onMouseDown={onArrastrarThumb} />
        )}
      </div>
      {navegacion}
    </div>
  );
}
