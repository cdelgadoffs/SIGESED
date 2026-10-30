import BotonSeleccionableMenu from '../base/BotonSeleccionableMenu.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useScrollbarPersonalizada } from '../../hooks/useScrollbarPersonalizada.js';
import { filtrarEstudiantes, nombreCompleto, ordenarPorTexto, registroActivo, segunEstado } from '../../utils/registros.js';
import '../../styles/widgets/ListaEstudiantesSidebar.css';

export default function ListaEstudiantesSidebar() {
  const { ESTUDIANTES, GRUPOS, CARGA } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, setRegistroSeleccionadoId, filtroEstado, sidebar3Abierto } = useUI();
  const { contenedorRef, thumb, onScroll, onArrastrarThumb } = useScrollbarPersonalizada();
  const { cargando, error } = CARGA.estudiantes;
  const visibles = ordenarPorTexto(segunEstado(filtrarEstudiantes(ESTUDIANTES, GRUPOS, terminoBusqueda), filtroEstado), nombreCompleto);
  const activo = registroActivo(visibles, registroSeleccionadoId);

  let mensaje = null;
  if (ESTUDIANTES.length === 0) mensaje = cargando ? 'Cargando…' : (error ? `No se pudieron cargar los estudiantes: ${error.mensaje}` : 'Aún no hay estudiantes registrados.');
  else if (visibles.length === 0) {
    mensaje = terminoBusqueda.trim()
      ? `Sin coincidencias para «${terminoBusqueda}».`
      : `No hay estudiantes ${filtroEstado === 'inactivos' ? 'inactiv' : 'activ'}os.`;
  }

  return (
    <div className="widget-lista-estudiantes-sidebar-wrap">
      <div className="widget-lista-estudiantes-sidebar" ref={contenedorRef} onScroll={onScroll}>
        {mensaje && <p className="widget-lista-estudiantes-sidebar-mensaje">{mensaje}</p>}
        {visibles.map((e) => (
          <div key={e.id} className={e.genero === 'mujer' ? 'widget-lista-estudiantes-sidebar-mujer' : undefined}>
            <BotonSeleccionableMenu
              icono="ri-user-line"
              deshabilitado={sidebar3Abierto}
              activo={e.id === activo?.id}
              onClick={() => setRegistroSeleccionadoId(e.id)}
            >
              <span className="widget-lista-estudiantes-sidebar-nombre">{nombreCompleto(e)}</span>
            </BotonSeleccionableMenu>
          </div>
        ))}
      </div>
      {thumb.visible && (
        <div
          className="widget-lista-estudiantes-sidebar-thumb"
          style={{ height: thumb.alto, top: thumb.top }}
          onMouseDown={onArrastrarThumb}
        />
      )}
    </div>
  );
}
