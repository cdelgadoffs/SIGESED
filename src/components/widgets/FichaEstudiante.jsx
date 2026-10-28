import Card from '../base/Card.jsx';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import IndicadorSync from '../base/IndicadorSync.jsx';
import OpcionesRegistro from './OpcionesRegistro.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { filtrarPersonas, nombreCompleto, nombreDeCatalogo, registroActivo } from '../../utils/registros.js';
import '../../styles/widgets/FichaEstudiante.css';

export default function FichaEstudiante() {
  const { ESTUDIANTES, PROGRAMAS_EDUCATIVOS, TIEMPOS, MODALIDADES, CARGA, eliminarEstudiante } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, abrirEdicionRegistro } = useUI();
  const alumno = registroActivo(filtrarPersonas(ESTUDIANTES, terminoBusqueda), registroSeleccionadoId);

  if (!alumno) {
    let mensaje = 'Registra a los estudiantes con el botón «+» de la lista.';
    if (ESTUDIANTES.length > 0) mensaje = 'Sin coincidencias.';
    else if (CARGA.estudiantes.cargando) mensaje = 'Cargando…';
    return <p className="widget-ficha-estudiante-mensaje">{mensaje}</p>;
  }

  return (
    <div className="widget-ficha-estudiante">
      <Card>
        <div className="widget-ficha-estudiante-encabezado">
          <span className="widget-ficha-estudiante-nombre">{nombreCompleto(alumno)}</span>
          <BadgeDinamico texto={alumno.matricula} icono="ri-id-card-line" tono="gris" title="Matrícula" />
          <IndicadorSync estado={alumno.sincronizacion} />
        </div>
        <dl className="widget-ficha-estudiante-datos">
          <dt>Programa educativo</dt>
          <dd>{nombreDeCatalogo(PROGRAMAS_EDUCATIVOS, alumno.programaEducativo)}</dd>
          <dt>Tiempo</dt>
          <dd>{nombreDeCatalogo(TIEMPOS, alumno.tiempo)}</dd>
          <dt>Modalidad</dt>
          <dd>{nombreDeCatalogo(MODALIDADES, alumno.modalidad)}</dd>
          <dt>Teléfono</dt>
          <dd>{alumno.telefono || 'Sin registrar'}</dd>
          <dt>Correo</dt>
          <dd>{alumno.correo || 'Sin registrar'}</dd>
        </dl>
        <div className="widget-ficha-estudiante-acciones">
          <OpcionesRegistro
            descripcion={`a ${nombreCompleto(alumno)} (matrícula ${alumno.matricula})`}
            onEditar={() => abrirEdicionRegistro(alumno.id)}
            onEliminar={() => eliminarEstudiante(alumno.id)}
          />
        </div>
      </Card>
    </div>
  );
}
