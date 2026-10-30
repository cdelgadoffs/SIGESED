import BadgeDinamico from '../base/BadgeDinamico.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { filtrarEstudiantes, nombreCompleto, nombreDeCatalogo, registroActivo, segunEstado } from '../../utils/registros.js';
import { fechaLarga } from '../../utils/fechas.js';
import '../../styles/widgets/ReportesEstudiante.css';

export default function ReportesEstudiante() {
  const { ESTUDIANTES, GRUPOS, REPORTES, TIPOS_REPORTE, CARGA } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, filtroEstado } = useUI();
  const alumno = registroActivo(segunEstado(filtrarEstudiantes(ESTUDIANTES, GRUPOS, terminoBusqueda), filtroEstado), registroSeleccionadoId);

  if (!alumno) {
    return <p className="widget-reportes-estudiante-mensaje">Elige un estudiante de la lista para ver su bitácora.</p>;
  }

  const reportes = REPORTES.filter((r) => r.estudianteId === alumno.id);

  let vacio = null;
  if (reportes.length === 0) vacio = CARGA.reportes.cargando ? 'Cargando…' : 'Sin reportes registrados.';

  return (
    <div className="widget-reportes-estudiante">
      <div className="widget-reportes-estudiante-encabezado">
        <h2 className="widget-reportes-estudiante-nombre">{nombreCompleto(alumno)}</h2>
        <BadgeDinamico texto={alumno.matricula} icono="ri-id-card-line" tono="gris" title="Matrícula" />
      </div>
      <div className="widget-reportes-estudiante-subtitulo">
        Reportes generales · {reportes.length} {reportes.length === 1 ? 'reporte' : 'reportes'}
      </div>
      {vacio && <p className="widget-reportes-estudiante-vacio">{vacio}</p>}
      <ul className="widget-reportes-estudiante-lista">
        {reportes.map((r) => (
          <li key={r.id} className="widget-reportes-estudiante-reporte">
            <div className="widget-reportes-estudiante-reporte-cabeza">
              <span className="widget-reportes-estudiante-fecha">{fechaLarga(r.fecha)}</span>
              {r.cicloId && <span className="widget-reportes-estudiante-ciclo">Ciclo {r.cicloId}</span>}
              <span className="widget-reportes-estudiante-tipo">
                <BadgeDinamico texto={nombreDeCatalogo(TIPOS_REPORTE, r.tipo)} tono="naranja" />
              </span>
            </div>
            <p className="widget-reportes-estudiante-descripcion">{r.descripcion}</p>
            {r.acciones && (
              <p className="widget-reportes-estudiante-acciones"><strong>Acciones tomadas:</strong> {r.acciones}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
