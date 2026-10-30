import { useEffect, useState } from 'react';
import BotonSeleccionableMenu from '../base/BotonSeleccionableMenu.jsx';
import SubMenuDD from './SubMenuDD.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useScrollbarPersonalizada } from '../../hooks/useScrollbarPersonalizada.js';
import { cuatrimestresDe, filtrarMaterias, nombreCuatrimestre } from '../../utils/planEstudios.js';
import '../../styles/widgets/ListaPlanEstudios.css';

export default function ListaPlanEstudios() {
  const { MATERIAS, CARGA } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, setRegistroSeleccionadoId, setSidebar2Amplio } = useUI();
  const { contenedorRef, thumb, onScroll, onArrastrarThumb } = useScrollbarPersonalizada();
  const [abierto, setAbierto] = useState(null);
  const buscando = terminoBusqueda.trim() !== '';
  const cuatrimestres = cuatrimestresDe(filtrarMaterias(MATERIAS, terminoBusqueda));
  const expandida = cuatrimestres.length > 0 && (buscando || abierto !== null);

  useEffect(() => {
    setSidebar2Amplio(expandida);
  }, [expandida, setSidebar2Amplio]);

  useEffect(() => () => setSidebar2Amplio(false), [setSidebar2Amplio]);

  const cuatrimestreSeleccionado = MATERIAS.find((m) => m.id === registroSeleccionadoId)?.cuatrimestre ?? null;

  useEffect(() => {
    setAbierto(cuatrimestreSeleccionado);
  }, [cuatrimestreSeleccionado]);

  function alternar(numero) {
    setAbierto((actual) => (actual === numero ? null : numero));
  }

  let mensaje = null;
  if (MATERIAS.length === 0) mensaje = CARGA.catalogos?.cargando ? 'Cargando…' : 'Aún no hay materias en el plan de estudios.';
  else if (cuatrimestres.length === 0) mensaje = `Sin coincidencias para «${terminoBusqueda}».`;

  return (
    <div className="widget-lista-plan-estudios-wrap">
      <div className="widget-lista-plan-estudios" ref={contenedorRef} onScroll={onScroll}>
        <BotonSeleccionableMenu icono="ri-dashboard-line" activo={!registroSeleccionadoId} onClick={() => { setRegistroSeleccionadoId(null); setAbierto(null); }}>
          Resumen y PDF
        </BotonSeleccionableMenu>
        {mensaje && <p className="widget-lista-plan-estudios-mensaje">{mensaje}</p>}
        {cuatrimestres.map(({ numero, materias }) => {
          const contieneActiva = materias.some((m) => m.id === registroSeleccionadoId);
          const desplegado = buscando || abierto === numero;
          return (
            <div key={numero}>
              <BotonSeleccionableMenu
                icono={desplegado ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'}
                activo={contieneActiva}
                badge={materias.length}
                onClick={() => alternar(numero)}
              >
                {nombreCuatrimestre(numero)}
              </BotonSeleccionableMenu>
              {desplegado && (
                <SubMenuDD
                  items={materias.map((m) => ({ id: m.id, nombre: m.nombre }))}
                  activoId={registroSeleccionadoId}
                  onSeleccionar={setRegistroSeleccionadoId}
                />
              )}
            </div>
          );
        })}
      </div>
      {thumb.visible && (
        <div
          className="widget-lista-plan-estudios-thumb"
          style={{ height: thumb.alto, top: thumb.top }}
          onMouseDown={onArrastrarThumb}
        />
      )}
    </div>
  );
}
