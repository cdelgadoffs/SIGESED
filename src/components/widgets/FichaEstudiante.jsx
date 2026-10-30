import Card from '../base/Card.jsx';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import OpcionesRegistro from './OpcionesRegistro.jsx';
import EstadoConfirmado from './EstadoConfirmado.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { estiloGenero, filtrarEstudiantes, nombreCompleto, nombreDeCatalogo, registroActivo, segunEstado } from '../../utils/registros.js';
import '../../styles/widgets/FichaEstudiante.css';

export default function FichaEstudiante() {
  const { ESTUDIANTES, GRUPOS, GENEROS, PROGRAMAS_EDUCATIVOS, TIEMPOS, MODALIDADES, CARGA, eliminarEstudiante, editarEstudiante } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, abrirEdicionRegistro, filtroEstado } = useUI();
  const alumno = registroActivo(segunEstado(filtrarEstudiantes(ESTUDIANTES, GRUPOS, terminoBusqueda), filtroEstado), registroSeleccionadoId);

  if (!alumno) {
    let mensaje = 'Registra a los estudiantes con el botón «+» de la lista.';
    if (ESTUDIANTES.length > 0) mensaje = 'Elige un estudiante de la lista.';
    else if (CARGA.estudiantes.cargando) mensaje = 'Cargando…';
    return <p className="widget-ficha-estudiante-mensaje">{mensaje}</p>;
  }

  const grupo = GRUPOS.find((g) => g.id === alumno.grupo);

  return (
    <div className={'widget-ficha-estudiante' + (alumno.activo !== false ? ' widget-ficha-estudiante-activo' : '')}>
      <Card>
        <div className="widget-ficha-estudiante-encabezado">
          <span className="widget-ficha-estudiante-nombre">{nombreCompleto(alumno)}</span>
          {alumno.genero && (
            <BadgeDinamico texto={nombreDeCatalogo(GENEROS, alumno.genero)} icono={estiloGenero(alumno.genero).icono} tono={estiloGenero(alumno.genero).tono} />
          )}
          <BadgeDinamico texto={alumno.matricula} icono="ri-id-card-line" tono="gris" title="Matrícula" />
        </div>
        <dl className="widget-ficha-estudiante-datos">
          <dt>Grupo</dt>
          <dd>{grupo?.nombre ?? 'Sin grupo'}</dd>
          <dt>Programa educativo</dt>
          <dd>{grupo ? nombreDeCatalogo(PROGRAMAS_EDUCATIVOS, grupo.programaEducativo) : '—'}</dd>
          <dt>Modalidad</dt>
          <dd>{grupo ? nombreDeCatalogo(MODALIDADES, grupo.modalidad) : '—'}</dd>
          <dt>Tiempo</dt>
          <dd>{nombreDeCatalogo(TIEMPOS, alumno.tiempo)}</dd>
          <dt>Teléfono</dt>
          <dd>{alumno.telefono || 'Sin registrar'}</dd>
          <dt>Correo</dt>
          <dd>{alumno.correo || 'Sin registrar'}</dd>
        </dl>
        <div className="widget-ficha-estudiante-acciones">
          <EstadoConfirmado tamano="grande" encendido={alumno.activo !== false} descripcion={`a ${nombreCompleto(alumno)}`} onCambiar={(activo) => editarEstudiante(alumno.id, { activo })} />
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
