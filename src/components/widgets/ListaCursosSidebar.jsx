import BotonSeleccionableMenu from '../base/BotonSeleccionableMenu.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useScrollbarPersonalizada } from '../../hooks/useScrollbarPersonalizada.js';
import { registroActivo } from '../../utils/registros.js';
import { coincideBusqueda } from '../../utils/texto.js';
import '../../styles/widgets/ListaCursosSidebar.css';

export default function ListaCursosSidebar() {
  const { CURSOS, CARGA } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, setRegistroSeleccionadoId, sidebar3Abierto } = useUI();
  const { contenedorRef, thumb, onScroll, onArrastrarThumb } = useScrollbarPersonalizada();
  const visibles = CURSOS.filter((c) => coincideBusqueda(terminoBusqueda, [c.nombre, c.cicloId]));
  const activo = registroActivo(visibles, registroSeleccionadoId);
  const ciclos = [...new Set(visibles.map((c) => c.cicloId))];

  let mensaje = null;
  if (CURSOS.length === 0) mensaje = CARGA.cursos?.cargando ? 'Cargando…' : 'Aún no hay cursos extracurriculares.';
  else if (visibles.length === 0) mensaje = `Sin coincidencias para «${terminoBusqueda}».`;

  return (
    <div className="widget-lista-cursos-sidebar-wrap">
      <div className="widget-lista-cursos-sidebar" ref={contenedorRef} onScroll={onScroll}>
        {mensaje && <p className="widget-lista-cursos-sidebar-mensaje">{mensaje}</p>}
        {ciclos.map((ciclo) => (
          <div key={ciclo}>
            <p className="widget-lista-cursos-sidebar-ciclo">{`Ciclo ${ciclo}`}</p>
            {visibles.filter((c) => c.cicloId === ciclo).map((c) => (
              <BotonSeleccionableMenu
                key={c.id}
                icono="ri-medal-line"
                deshabilitado={sidebar3Abierto}
                activo={c.id === activo?.id}
                onClick={() => setRegistroSeleccionadoId(c.id)}
              >
                <span className="widget-lista-cursos-sidebar-nombre">{c.nombre}</span>
              </BotonSeleccionableMenu>
            ))}
          </div>
        ))}
      </div>
      {thumb.visible && (
        <div className="widget-lista-cursos-sidebar-thumb" style={{ height: thumb.alto, top: thumb.top }} onMouseDown={onArrastrarThumb} />
      )}
    </div>
  );
}
