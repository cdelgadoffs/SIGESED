import BotonSeleccionableMenu from '../base/BotonSeleccionableMenu.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useScrollbarPersonalizada } from '../../hooks/useScrollbarPersonalizada.js';
import { filtrarPersonas, nombreCompleto, registroActivo } from '../../utils/registros.js';
import '../../styles/widgets/ListaPersonalSidebar.css';

export default function ListaPersonalSidebar() {
  const { PERSONAL, CARGA } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, setRegistroSeleccionadoId } = useUI();
  const { contenedorRef, thumb, onScroll, onArrastrarThumb } = useScrollbarPersonalizada();
  const { cargando, error } = CARGA.personal;
  const visibles = filtrarPersonas(PERSONAL, terminoBusqueda);
  const activo = registroActivo(visibles, registroSeleccionadoId);

  let mensaje = null;
  if (PERSONAL.length === 0) mensaje = cargando ? 'Cargando…' : (error ? `No se pudo cargar el personal: ${error.mensaje}` : 'Aún no hay personal registrado.');
  else if (visibles.length === 0) mensaje = `Sin coincidencias para «${terminoBusqueda}».`;

  return (
    <div className="widget-lista-personal-sidebar-wrap">
      <div className="widget-lista-personal-sidebar" ref={contenedorRef} onScroll={onScroll}>
        {mensaje && <p className="widget-lista-personal-sidebar-mensaje">{mensaje}</p>}
        {visibles.map((p) => (
          <div key={p.id} className={p.genero === 'mujer' ? 'widget-lista-personal-sidebar-mujer' : undefined}>
            <BotonSeleccionableMenu activo={p.id === activo?.id} onClick={() => setRegistroSeleccionadoId(p.id)}>
              <span className="widget-lista-personal-sidebar-nombre">{nombreCompleto(p)}</span>
            </BotonSeleccionableMenu>
          </div>
        ))}
      </div>
      {thumb.visible && (
        <div
          className="widget-lista-personal-sidebar-thumb"
          style={{ height: thumb.alto, top: thumb.top }}
          onMouseDown={onArrastrarThumb}
        />
      )}
    </div>
  );
}
