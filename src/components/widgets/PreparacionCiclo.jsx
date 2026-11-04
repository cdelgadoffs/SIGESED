import { useState } from 'react';
import Card from '../base/Card.jsx';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import BotonS from '../base/BotonS.jsx';
import Modal from '../base/Modal.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { ESTADOS_CICLO } from '../../utils/fechas.js';
import { MATERIAS_POR_GRUPO, inscripcionDe, tramosHorario, tipoHorario } from '../../utils/inscripciones.js';
import { nombreCompleto, nombreDeCatalogo } from '../../utils/registros.js';
import '../../styles/widgets/PreparacionCiclo.css';

function Marca({ completo }) {
  return (
    <i
      className={(completo ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line') + ' widget-preparacion-ciclo-marca' + (completo ? ' widget-preparacion-ciclo-marca-completa' : '')}
      aria-label={completo ? 'Completo' : 'Pendiente'}
    />
  );
}

function Pendientes({ lista }) {
  if (lista.length === 0) return null;
  return (
    <ul className="widget-preparacion-ciclo-pendientes">
      {lista.map((p) => <li key={p.mensaje}>{p.mensaje}</li>)}
    </ul>
  );
}

export default function PreparacionCiclo() {
  const { CICLOS, cicloActivoId, GRUPOS, MODALIDADES, MATERIAS, HORAS_CLASE, PERSONAL, INSCRIPCIONES, iniciarCiclo } = useRegistros();
  const { setCicloEnEdicionId, grupoEnInscripcionId, setGrupoEnInscripcionId } = useUI();
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const ciclo = CICLOS.find((c) => c.id === cicloActivoId);
  if (!ciclo) return null;

  const pendientes = ciclo.pendientesInicio ?? [];
  const delPaso = (paso, grupoId = null) => pendientes.filter((p) => p.paso === paso && (p.grupoId ?? null) === grupoId);
  const activos = GRUPOS.filter((g) => g.activo !== false);
  const estado = ESTADOS_CICLO[ciclo.estado] ?? ESTADOS_CICLO['sin-configurar'];

  function inscribir(grupoId) {
    setCicloEnEdicionId(null);
    setGrupoEnInscripcionId(grupoId);
  }

  function cerrar() {
    setConfirmando(false);
    setError(null);
  }

  async function iniciar() {
    setOcupado(true);
    setError(null);
    try {
      await iniciarCiclo(ciclo.id);
      setConfirmando(false);
      setCicloEnEdicionId(null);
      setGrupoEnInscripcionId(null);
    } catch (e) {
      setError(e?.mensaje ?? 'No se pudo iniciar el ciclo.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="widget-preparacion-ciclo">
      <Card>
        <div className="widget-preparacion-ciclo-encabezado">
          <span className="widget-preparacion-ciclo-titulo">Preparación del ciclo escolar {ciclo.id}</span>
          {pendientes.length > 0
            ? <BadgeDinamico texto={`${pendientes.length} ${pendientes.length === 1 ? 'pendiente' : 'pendientes'}`} icono="ri-error-warning-line" tono="naranja" />
            : <BadgeDinamico texto="Listo para iniciar" icono="ri-check-line" tono="verde" />}
          <BadgeDinamico texto={estado.texto} tono={estado.tono} />
        </div>

        <div className="widget-preparacion-ciclo-cuerpo">
          {delPaso('calendario').length > 0 && (
            <p className="widget-preparacion-ciclo-aviso">
              <i className="ri-calendar-todo-line" />
              {' El calendario tiene pendientes: revísalo en el panel de la derecha.'}
            </p>
          )}
          <div className="widget-preparacion-ciclo-seccion">{`Grupos activos (${MATERIAS_POR_GRUPO} materias cada uno)`}</div>
          <Pendientes lista={delPaso('grupos')} />
          {activos.map((g) => {
            const materias = inscripcionDe(INSCRIPCIONES, ciclo.id, g.id)?.materias ?? [];
            const tipo = tipoHorario(g, MODALIDADES);
            const propios = delPaso('grupo', g.id);
            return (
              <section key={g.id} className={'widget-preparacion-ciclo-paso' + (grupoEnInscripcionId === g.id ? ' widget-preparacion-ciclo-paso-activo' : '')}>
                <div className="widget-preparacion-ciclo-paso-encabezado">
                  <Marca completo={propios.length === 0} />
                  <span className="widget-preparacion-ciclo-paso-titulo">{g.nombre}</span>
                  <BadgeDinamico texto={nombreDeCatalogo(MODALIDADES, g.modalidad)} tono="gris" />
                  <BotonS variant="claro" onClick={() => inscribir(g.id)}>{materias.length > 0 ? 'Editar' : 'Inscribir materias'}</BotonS>
                </div>
                {materias.length > 0 && (
                  <div className="widget-preparacion-ciclo-materias">
                    {materias.map((m) => {
                      const materia = MATERIAS.find((x) => x.id === m.materia);
                      const docente = PERSONAL.find((p) => p.id === m.docenteId);
                      return (
                        <div key={m.materia} className="widget-preparacion-ciclo-materia">
                          <span className="widget-preparacion-ciclo-materia-nombre">{materia ? `${materia.clave} · ${materia.nombre}` : m.materia}</span>
                          <span>{docente ? nombreCompleto(docente) : 'Sin docente'}</span>
                          <span className="widget-preparacion-ciclo-materia-horario">
                            {tipo === null ? 'Sin horario (Online)' : m.horario.length === 0 ? 'Sin horario' : tramosHorario(m.horario, HORAS_CLASE).map((t, i) => (
                              <span key={i} className={`widget-preparacion-ciclo-dia widget-preparacion-ciclo-dia-${t.dia}`}>{t.texto}</span>
                            ))}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Pendientes lista={propios} />
              </section>
            );
          })}
        </div>

        <div className="widget-preparacion-ciclo-pie">
          <span className="widget-preparacion-ciclo-nota">
            {pendientes.length > 0
              ? 'Completa los pendientes para poder iniciar el ciclo.'
              : 'Al iniciar, el calendario y las inscripciones quedan fijos.'}
          </span>
          <BotonS variant="claro" onClick={() => setConfirmando(true)} disabled={pendientes.length > 0}>Iniciar ciclo escolar</BotonS>
        </div>
      </Card>

      <Modal abierto={confirmando} titulo="Iniciar ciclo escolar" onCerrar={cerrar}>
        <p className="widget-preparacion-ciclo-modal-texto">
          {`¿Iniciar el ciclo escolar ${ciclo.id}? El calendario y las inscripciones de los grupos quedarán fijos y se habilitará la captura de evaluaciones.`}
        </p>
        {error && <p className="widget-preparacion-ciclo-modal-error">{error}</p>}
        <div className="widget-preparacion-ciclo-modal-acciones">
          <BotonS variant="claro" onClick={cerrar}>Cancelar</BotonS>
          <BotonS variant="claro" onClick={iniciar} disabled={ocupado}>Iniciar</BotonS>
        </div>
      </Modal>
    </div>
  );
}
