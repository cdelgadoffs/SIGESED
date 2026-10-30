import BotonSeleccionableMenu from '../base/BotonSeleccionableMenu.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useScrollbarPersonalizada } from '../../hooks/useScrollbarPersonalizada.js';
import { registroActivo } from '../../utils/registros.js';
import { coincideBusqueda } from '../../utils/texto.js';
import '../../styles/widgets/ListaGruposSidebar.css';

export default function ListaGruposSidebar() {
  const { GRUPOS, CARGA } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, setRegistroSeleccionadoId } = useUI();
  const { contenedorRef, thumb, onScroll, onArrastrarThumb } = useScrollbarPersonalizada();
  const { cargando, error } = CARGA.grupos;
  const visibles = GRUPOS.filter((g) => coincideBusqueda(terminoBusqueda, [g.nombre]));
  const activo = registroActivo(visibles, registroSeleccionadoId);

  let mensaje = null;
  if (GRUPOS.length === 0) mensaje = cargando ? 'Cargando…' : (error ? `No se pudieron cargar los grupos: ${error.mensaje}` : 'Aún no hay grupos registrados.');
  else if (visibles.length === 0) mensaje = `Sin coincidencias para «${terminoBusqueda}».`;

  return (
    <div className="widget-lista-grupos-sidebar-wrap">
      <div className="widget-lista-grupos-sidebar" ref={contenedorRef} onScroll={onScroll}>
        {mensaje && <p className="widget-lista-grupos-sidebar-mensaje">{mensaje}</p>}
        {visibles.map((g) => (
          <BotonSeleccionableMenu key={g.id} activo={g.id === activo?.id} onClick={() => setRegistroSeleccionadoId(g.id)}>
            <span className="widget-lista-grupos-sidebar-nombre">{g.nombre}</span>
          </BotonSeleccionableMenu>
        ))}
      </div>
      {thumb.visible && (
        <div
          className="widget-lista-grupos-sidebar-thumb"
          style={{ height: thumb.alto, top: thumb.top }}
          onMouseDown={onArrastrarThumb}
        />
      )}
    </div>
  );
}
