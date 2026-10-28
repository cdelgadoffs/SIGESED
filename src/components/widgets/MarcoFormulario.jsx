import BotonS from '../base/BotonS.jsx';
import { useScrollbarPersonalizada } from '../../hooks/useScrollbarPersonalizada.js';
import '../../styles/widgets/MarcoFormulario.css';

export default function MarcoFormulario({ error, textoConfirmar, puedeConfirmar, onCancelar, onConfirmar, oscuro = false, children }) {
  const { contenedorRef, thumb, onScroll, onArrastrarThumb } = useScrollbarPersonalizada();
  const variante = oscuro ? 'oscuro' : 'claro';
  return (
    <div className={'widget-marco-formulario-wrap' + (oscuro ? ' widget-marco-formulario-oscuro' : '')}>
      <div className="widget-marco-formulario" ref={contenedorRef} onScroll={onScroll}>
        <div className="widget-marco-formulario-campos">{children}</div>
        {error && <div className="widget-marco-formulario-error">{error}</div>}
        <div className="widget-marco-formulario-acciones">
          <BotonS variant={variante} onClick={onCancelar}>Cancelar</BotonS>
          <BotonS variant={variante} onClick={onConfirmar} disabled={!puedeConfirmar}>{textoConfirmar}</BotonS>
        </div>
      </div>
      {thumb.visible && (
        <div
          className="widget-marco-formulario-scrollbar-thumb"
          style={{ height: thumb.alto, top: thumb.top }}
          onMouseDown={onArrastrarThumb}
        />
      )}
    </div>
  );
}
