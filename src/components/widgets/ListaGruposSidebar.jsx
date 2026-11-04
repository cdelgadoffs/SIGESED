import BotonSeleccionableMenu from '../base/BotonSeleccionableMenu.jsx';
import EstadoConfirmado from './EstadoConfirmado.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useScrollbarPersonalizada } from '../../hooks/useScrollbarPersonalizada.js';
import { ordenarPorTexto, registroActivo, segunEstado } from '../../utils/registros.js';
import { coincideBusqueda } from '../../utils/texto.js';
import '../../styles/widgets/ListaGruposSidebar.css';

export default function ListaGruposSidebar() {
  const { GRUPOS, CARGA, editarGrupo } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, setRegistroSeleccionadoId, filtroEstado, sidebar3Abierto } = useUI();
  const { contenedorRef, thumb, onScroll, onArrastrarThumb } = useScrollbarPersonalizada();
  const { cargando, error } = CARGA.grupos;
  const visibles = ordenarPorTexto(segunEstado(GRUPOS.filter((g) => coincideBusqueda(terminoBusqueda, [g.nombre])), filtroEstado), (g) => g.nombre);
  const activo = registroActivo(visibles, registroSeleccionadoId);

  let mensaje = null;
  if (GRUPOS.length === 0) mensaje = cargando ? 'Cargando…' : (error ? `No se pudieron cargar los grupos: ${error.mensaje}` : 'Aún no hay grupos registrados.');
  else if (visibles.length === 0) {
    mensaje = terminoBusqueda.trim()
      ? `Sin coincidencias para «${terminoBusqueda}».`
      : `No hay grupos ${filtroEstado === 'inactivos' ? 'inactiv' : 'activ'}os.`;
  }

  return (
    <div className="widget-lista-grupos-sidebar-wrap">
      <div className="widget-lista-grupos-sidebar" ref={contenedorRef} onScroll={onScroll}>
        {mensaje && <p className="widget-lista-grupos-sidebar-mensaje">{mensaje}</p>}
        {visibles.map((g) => (
          <BotonSeleccionableMenu
            key={g.id}
            icono="ri-group-line"
            deshabilitado={sidebar3Abierto}
            activo={g.id === activo?.id}
            onClick={() => setRegistroSeleccionadoId(g.id)}
            accion={(
              <span className="widget-lista-grupos-sidebar-estado">
                <EstadoConfirmado
                  encendido={g.activo}
                  descripcion={`el grupo ${g.nombre}`}
                  onCambiar={(activo) => editarGrupo(g.id, { activo })}
                />
              </span>
            )}
          >
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
