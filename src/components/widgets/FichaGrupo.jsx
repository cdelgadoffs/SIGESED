import Card from '../base/Card.jsx';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import IndicadorSync from '../base/IndicadorSync.jsx';
import OpcionesRegistro from './OpcionesRegistro.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { nombreCompleto, nombreDeCatalogo, registroActivo, segunEstado } from '../../utils/registros.js';
import { coincideBusqueda } from '../../utils/texto.js';
import '../../styles/widgets/FichaGrupo.css';

export default function FichaGrupo() {
  const { GRUPOS, ESTUDIANTES, PERSONAL, PROGRAMAS_EDUCATIVOS, MODALIDADES, CARGA, eliminarGrupo } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, abrirEdicionRegistro, filtroEstado } = useUI();
  const grupo = registroActivo(segunEstado(GRUPOS.filter((g) => coincideBusqueda(terminoBusqueda, [g.nombre])), filtroEstado), registroSeleccionadoId);

  if (!grupo) {
    let mensaje = 'Registra los grupos con el botón «+» de la lista.';
    if (GRUPOS.length > 0) mensaje = 'Elige un grupo de la lista.';
    else if (CARGA.grupos.cargando) mensaje = 'Cargando…';
    return <p className="widget-ficha-grupo-mensaje">{mensaje}</p>;
  }

  const alumnos = ESTUDIANTES.filter((e) => e.grupo === grupo.id);
  const docentes = PERSONAL.filter((p) => (p.grupos || []).includes(grupo.id));

  return (
    <div className="widget-ficha-grupo">
      <Card>
        <div className="widget-ficha-grupo-encabezado">
          <span className="widget-ficha-grupo-nombre">{grupo.nombre}</span>
          <BadgeDinamico texto={`${alumnos.length} ${alumnos.length === 1 ? 'estudiante' : 'estudiantes'}`} icono="ri-group-line" tono="gris" />
          <IndicadorSync estado={grupo.sincronizacion} />
        </div>
        <dl className="widget-ficha-grupo-datos">
          <dt>Programa educativo</dt>
          <dd>{nombreDeCatalogo(PROGRAMAS_EDUCATIVOS, grupo.programaEducativo)}</dd>
          <dt>Modalidad</dt>
          <dd>{nombreDeCatalogo(MODALIDADES, grupo.modalidad)}</dd>
          <dt>Docentes</dt>
          <dd className="widget-ficha-grupo-lista">
            {docentes.length > 0
              ? docentes.map((p) => <BadgeDinamico key={p.id} texto={nombreCompleto(p)} tono="azul" />)
              : 'Sin asignar'}
          </dd>
        </dl>
        <div className="widget-ficha-grupo-acciones">
          <OpcionesRegistro
            descripcion={`el grupo ${grupo.nombre}`}
            onEditar={() => abrirEdicionRegistro(grupo.id)}
            onEliminar={() => eliminarGrupo(grupo.id)}
          />
        </div>
      </Card>
    </div>
  );
}
