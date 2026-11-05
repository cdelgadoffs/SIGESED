import CampoTexto from '../base/CampoTexto.jsx';
import FormularioReporte from './FormularioReporte.jsx';
import ReportesEstudiante from './ReportesEstudiante.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { filtrarEstudiantes, nombreCompleto, ordenarPorTexto, segunEstado } from '../../utils/registros.js';
import '../../styles/widgets/BitacoraMovil.css';

const MAX_RESULTADOS = 30;

export default function BitacoraMovil() {
  const { ESTUDIANTES, GRUPOS, CARGA } = useRegistros();
  const { terminoBusqueda, setTerminoBusqueda, registroSeleccionadoId, setRegistroSeleccionadoId } = useUI();
  const activos = segunEstado(ESTUDIANTES, 'activos');
  const alumno = activos.find((e) => e.id === registroSeleccionadoId);

  if (alumno) {
    return (
      <div className="widget-bitacora-movil">
        <button type="button" className="widget-bitacora-movil-volver" onClick={() => setRegistroSeleccionadoId(null)}>
          <i className="ri-arrow-left-line" aria-hidden="true" /> Elegir otra alumna
        </button>
        <div className="widget-bitacora-movil-formulario">
          <FormularioReporte />
        </div>
        <ReportesEstudiante />
      </div>
    );
  }

  const resultados = ordenarPorTexto(segunEstado(filtrarEstudiantes(ESTUDIANTES, GRUPOS, terminoBusqueda), 'activos'), nombreCompleto);
  return (
    <div className="widget-bitacora-movil">
      <CampoTexto value={terminoBusqueda} onChange={setTerminoBusqueda} placeholder="Buscar por nombre, matrícula o grupo…" ariaLabel="Buscar alumna" />
      {CARGA.estudiantes.cargando && <p className="widget-bitacora-movil-mensaje">Cargando…</p>}
      {!CARGA.estudiantes.cargando && resultados.length === 0 && <p className="widget-bitacora-movil-mensaje">Sin resultados.</p>}
      <div className="widget-bitacora-movil-lista">
        {resultados.slice(0, MAX_RESULTADOS).map((e) => {
          const grupo = GRUPOS.find((g) => g.id === e.grupo);
          return (
            <button
              key={e.id}
              type="button"
              className="widget-bitacora-movil-alumna"
              onClick={() => { setRegistroSeleccionadoId(e.id); setTerminoBusqueda(''); }}
            >
              <span className="widget-bitacora-movil-alumna-nombre">{nombreCompleto(e)}</span>
              <span className="widget-bitacora-movil-alumna-detalle">{[e.matricula, grupo?.nombre].filter(Boolean).join(' · ')}</span>
            </button>
          );
        })}
      </div>
      {resultados.length > MAX_RESULTADOS && <p className="widget-bitacora-movil-mensaje">{`Se muestran ${MAX_RESULTADOS} de ${resultados.length}. Escribe para afinar la búsqueda.`}</p>}
    </div>
  );
}
