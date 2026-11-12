import BadgeDinamico from '../base/BadgeDinamico.jsx';
import CampoTexto from '../base/CampoTexto.jsx';
import OpcionesNavegacion from './OpcionesNavegacion.jsx';
import FormularioEvaluacion from './FormularioEvaluacion.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { filtrarEstudiantes, nombreCompleto, ordenarPorTexto, segunEstado } from '../../utils/registros.js';
import { ESTADOS_CICLO } from '../../utils/fechas.js';
import { estudiantesDelDocente } from '../../utils/inscripciones.js';
import '../../styles/widgets/EvaluacionesMovil.css';

const MAX_RESULTADOS = 30;

export default function EvaluacionesMovil() {
  const { ESTUDIANTES, GRUPOS, INSCRIPCIONES, CICLOS, cicloActivoId, seleccionarCiclo, CARGA } = useRegistros();
  const { puede, cuentaActiva } = useAuth();
  const { terminoBusqueda, setTerminoBusqueda, registroSeleccionadoId, setRegistroSeleccionadoId } = useUI();
  const indice = CICLOS.findIndex((c) => c.id === cicloActivoId);
  const ciclo = CICLOS[indice];
  const estado = ciclo ? ESTADOS_CICLO[ciclo.estado] : null;

  const soloPropios = !puede('evaluaciones', 'editar');
  const disponibles = segunEstado(soloPropios ? estudiantesDelDocente(ESTUDIANTES, INSCRIPCIONES, cicloActivoId, cuentaActiva?.usuario) : ESTUDIANTES, 'activos');
  const alumno = disponibles.find((e) => e.id === registroSeleccionadoId);

  const selectorCiclo = (
    <div className="widget-evaluaciones-movil-ciclo">
      <OpcionesNavegacion
        onAnterior={() => seleccionarCiclo(CICLOS[indice - 1].id)}
        onSiguiente={() => seleccionarCiclo(CICLOS[indice + 1].id)}
        anteriorDeshabilitado={indice <= 0}
        siguienteDeshabilitado={indice < 0 || indice >= CICLOS.length - 1}
        etiquetaAnterior="Ciclo anterior"
        etiquetaSiguiente="Ciclo siguiente"
      />
      <span className="widget-evaluaciones-movil-ciclo-nombre">{ciclo ? `Ciclo escolar ${ciclo.id}` : 'Sin ciclo escolar'}</span>
      {estado && <BadgeDinamico texto={ciclo.cerrado ? 'Cerrado' : estado.texto} tono="azul" />}
    </div>
  );

  if (alumno) {
    return (
      <div className="widget-evaluaciones-movil">
        <button type="button" className="widget-evaluaciones-movil-volver" onClick={() => setRegistroSeleccionadoId(null)}>
          <i className="ri-arrow-left-line" aria-hidden="true" /> Elegir otro estudiante
        </button>
        {selectorCiclo}
        <div className="widget-evaluaciones-movil-formulario">
          <FormularioEvaluacion />
        </div>
        <p className="widget-evaluaciones-movil-mensaje">La boleta se imprime en la versión de escritorio.</p>
      </div>
    );
  }

  const resultados = ordenarPorTexto(filtrarEstudiantes(disponibles, GRUPOS, terminoBusqueda), nombreCompleto);
  return (
    <div className="widget-evaluaciones-movil">
      {selectorCiclo}
      <CampoTexto value={terminoBusqueda} onChange={setTerminoBusqueda} placeholder="Buscar por nombre, matrícula o grupo…" ariaLabel="Buscar estudiante" />
      {CARGA.estudiantes.cargando && <p className="widget-evaluaciones-movil-mensaje">Cargando…</p>}
      {!CARGA.estudiantes.cargando && resultados.length === 0 && (
        <p className="widget-evaluaciones-movil-mensaje">{soloPropios && disponibles.length === 0 ? 'No tienes alumnos en este ciclo escolar.' : 'Sin resultados.'}</p>
      )}
      <div className="widget-evaluaciones-movil-lista">
        {resultados.slice(0, MAX_RESULTADOS).map((e) => {
          const grupo = GRUPOS.find((g) => g.id === e.grupo);
          return (
            <button
              key={e.id}
              type="button"
              className="widget-evaluaciones-movil-alumno"
              onClick={() => { setRegistroSeleccionadoId(e.id); setTerminoBusqueda(''); }}
            >
              <span className="widget-evaluaciones-movil-alumno-nombre">{nombreCompleto(e)}</span>
              <span className="widget-evaluaciones-movil-alumno-detalle">{[e.matricula, grupo?.nombre].filter(Boolean).join(' · ')}</span>
            </button>
          );
        })}
      </div>
      {resultados.length > MAX_RESULTADOS && <p className="widget-evaluaciones-movil-mensaje">{`Se muestran ${MAX_RESULTADOS} de ${resultados.length}. Escribe para afinar la búsqueda.`}</p>}
    </div>
  );
}
