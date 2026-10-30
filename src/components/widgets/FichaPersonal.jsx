import Card from '../base/Card.jsx';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import IndicadorSync from '../base/IndicadorSync.jsx';
import OpcionesRegistro from './OpcionesRegistro.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { estiloGenero, filtrarPersonas, nombreCompleto, nombreDeCatalogo, registroActivo } from '../../utils/registros.js';
import '../../styles/widgets/FichaPersonal.css';

export default function FichaPersonal() {
  const { PERSONAL, GENEROS, ROLES, GRUPOS, CARGA, eliminarPersonal } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, abrirEdicionRegistro } = useUI();
  const persona = registroActivo(filtrarPersonas(PERSONAL, terminoBusqueda), registroSeleccionadoId);

  if (!persona) {
    const mensaje = PERSONAL.length === 0 && CARGA.personal.cargando
      ? 'Cargando…'
      : 'Registra al personal administrativo con el botón «+» de la lista.';
    return <p className="widget-ficha-personal-mensaje">{PERSONAL.length > 0 ? 'Sin coincidencias.' : mensaje}</p>;
  }

  const estilo = estiloGenero(persona.genero);

  return (
    <div className="widget-ficha-personal">
      <Card>
        <div className="widget-ficha-personal-encabezado">
          <span className="widget-ficha-personal-nombre">{nombreCompleto(persona)}</span>
          <BadgeDinamico texto={nombreDeCatalogo(GENEROS, persona.genero)} icono={estilo.icono} tono={estilo.tono} />
          <IndicadorSync estado={persona.sincronizacion} />
        </div>
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
          {persona.grupos.length > 0 && (
            <>
              <dt>Grupos</dt>
              <dd className="widget-ficha-personal-roles">
                {persona.grupos.map((id) => <BadgeDinamico key={id} texto={GRUPOS.find((g) => g.id === id)?.nombre ?? id} tono="gris" />)}
              </dd>
            </>
          )}
        </dl>
        <div className="widget-ficha-personal-acciones">
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
