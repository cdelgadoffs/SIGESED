import Card from '../base/Card.jsx';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import OpcionesRegistro from './OpcionesRegistro.jsx';
import CodigoQR from './CodigoQR.jsx';
import EstadoConfirmado from './EstadoConfirmado.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { materiasDeDocente } from '../../utils/inscripciones.js';
import { estiloGenero, filtrarPersonas, nombreCompleto, nombreDeCatalogo, registroActivo, segunEstado } from '../../utils/registros.js';
import '../../styles/widgets/FichaPersonal.css';

export default function FichaPersonal() {
  const { PERSONAL, GENEROS, ROLES, GRUPOS, MATERIAS, INSCRIPCIONES, cicloActivoId, CARGA, eliminarPersonal, editarPersonal } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, abrirEdicionRegistro, filtroEstado } = useUI();
  const persona = registroActivo(segunEstado(filtrarPersonas(PERSONAL, terminoBusqueda), filtroEstado), registroSeleccionadoId);

  if (!persona) {
    const mensaje = PERSONAL.length === 0 && CARGA.personal.cargando
      ? 'Cargando…'
      : 'Registra al personal administrativo con el botón «+» de la lista.';
    return <p className="widget-ficha-personal-mensaje">{PERSONAL.length > 0 ? 'Elige a una persona de la lista.' : mensaje}</p>;
  }

  const estilo = estiloGenero(persona.genero);
  const asignadas = materiasDeDocente(INSCRIPCIONES, cicloActivoId, persona.id);

  return (
    <div className={'widget-ficha-personal' + (persona.activo !== false ? ' widget-ficha-personal-activo' : '')}>
      <Card>
        <div className="widget-ficha-personal-encabezado">
          <span className="widget-ficha-personal-nombre">{nombreCompleto(persona)}</span>
          <BadgeDinamico texto={nombreDeCatalogo(GENEROS, persona.genero)} icono={estilo.icono} tono={estilo.tono} />
        </div>
        <div className="widget-ficha-personal-cuerpo">
        <dl className="widget-ficha-personal-datos">
          <dt>Teléfono</dt>
          <dd>{persona.telefono || 'Sin registrar'}</dd>
          <dt>Correo</dt>
          <dd>{persona.correo || 'Sin registrar'}</dd>
          <dt>Roles</dt>
          <dd className="widget-ficha-personal-roles">
            {persona.roles.length > 0
              ? persona.roles.map((id) => <BadgeDinamico key={id} texto={nombreDeCatalogo(ROLES, id)} tono="azul" />)
              : 'Sin asignar'}
          </dd>
          {asignadas.length > 0 && (
            <>
              <dt>{`Materias (${cicloActivoId})`}</dt>
              <dd className="widget-ficha-personal-roles">
                {asignadas.map((m) => (
                  <BadgeDinamico
                    key={`${m.grupoId}:${m.materia}`}
                    texto={`${GRUPOS.find((g) => g.id === m.grupoId)?.nombre ?? m.grupoId} · ${MATERIAS.find((x) => x.id === m.materia)?.nombre ?? m.materia}`}
                    tono="gris"
                  />
                ))}
              </dd>
            </>
          )}
        </dl>
        <CodigoQR texto={persona.id} leyenda="Personal" nombreArchivo={`QR_${nombreCompleto(persona).replace(/\s+/g, '_')}`} />
        </div>
        <div className="widget-ficha-personal-acciones">
          <EstadoConfirmado tamano="grande" encendido={persona.activo !== false} descripcion={`a ${nombreCompleto(persona)}`} onCambiar={(activo) => editarPersonal(persona.id, { activo })} />
          <OpcionesRegistro
            descripcion={`a ${nombreCompleto(persona)} del personal`}
            onEditar={() => abrirEdicionRegistro(persona.id)}
            onEliminar={() => eliminarPersonal(persona.id)}
          />
        </div>
      </Card>
    </div>
  );
}
