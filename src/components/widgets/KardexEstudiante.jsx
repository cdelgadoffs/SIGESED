import { useRef, useState } from 'react';
import BotonS from '../base/BotonS.jsx';
import Modal from '../base/Modal.jsx';
import CampoTexto from '../base/CampoTexto.jsx';
import { esAdministradorTI } from '../../utils/permisos.js';
import { hoyLocal } from '../../utils/fechas.js';
import { documentoMencion } from '../../utils/mencionHonorifica.js';
import { imprimirDocumento } from '../../utils/impresion.js';
import logoIcom from '../../assets/Icom.png';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import ListaExpandible from '../base/ListaExpandible.jsx';
import OpcionesRegistro from './OpcionesRegistro.jsx';
import VistaPreviaKardex from './VistaPreviaKardex.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useScrollbarPersonalizada } from '../../hooks/useScrollbarPersonalizada.js';
import { filtrarEstudiantes, nombreCompleto, nombreDeCatalogo, registroActivo, segunEstado } from '../../utils/registros.js';
import { nombreCuatrimestre } from '../../utils/planEstudios.js';
import { CALIFICACION_APROBATORIA, formatoPromedio, observacionKardex, textoCalificacion } from '../../utils/kardex.js';
import '../../styles/widgets/KardexEstudiante.css';

const TODOS = 'todos';

export default function KardexEstudiante() {
  const { ESTUDIANTES, GRUPOS, CARGA } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, filtroEstado } = useUI();
  const alumno = registroActivo(segunEstado(filtrarEstudiantes(ESTUDIANTES, GRUPOS, terminoBusqueda), filtroEstado), registroSeleccionadoId);

  if (!alumno) {
    return <p className="widget-kardex-estudiante-mensaje">{CARGA.estudiantes.cargando ? 'Cargando…' : 'Elige un estudiante de la lista para ver su kárdex.'}</p>;
  }
  return <Kardex alumno={alumno} />;
}

function Kardex({ alumno }) {
  const { GRUPOS, KARDEX, MATERIAS, PROGRAMAS_EDUCATIVOS, MODALIDADES, TIEMPOS, eliminarCalificacionKardex } = useRegistros();
  const { abrirEdicionRegistro, sidebar3Abierto } = useUI();
  const puedeEditar = useAuth().puede('kardex', 'editar');
  const { contenedorRef, thumb, onScroll, onArrastrarThumb } = useScrollbarPersonalizada();
  const [filtro, setFiltro] = useState(TODOS);
  const [alternados, setAlternados] = useState(() => new Set());

  const grupo = GRUPOS.find((g) => g.id === alumno.grupo);
  const kardex = KARDEX.find((k) => k.estudianteId === alumno.id);
  const materiaDe = new Map(MATERIAS.map((m) => [m.id, m]));
  const cuatrimestres = kardex?.cuatrimestres ?? [];
  const vigente = cuatrimestres.some((c) => c.numero === filtro) ? filtro : TODOS;
  const visibles = vigente === TODOS ? cuatrimestres : cuatrimestres.filter((c) => c.numero === vigente);
  const totalDe = (n) => MATERIAS.filter((m) => m.programaEducativo === grupo?.programaEducativo && m.cuatrimestre === n).length;
  const calificadas = (c) => c.materias.filter((m) => m.calificacion !== null).length;
  const completo = (c) => calificadas(c) >= totalDe(c.numero) && totalDe(c.numero) > 0;
  const abierto = (c) => alternados.has(c.numero) ? completo(c) : !completo(c);
  const alternar = (n) => setAlternados((prev) => { const s = new Set(prev); if (s.has(n)) s.delete(n); else s.add(n); return s; });
  const todosAbiertos = visibles.length > 0 && visibles.every(abierto);
  const alternarTodos = () => setAlternados(new Set(cuatrimestres.filter((c) => completo(c) !== todosAbiertos).map((c) => c.numero)));
  const iniciales = [alumno.nombre, alumno.primerApellido].map((t) => (t ?? '').trim()[0] ?? '').join('').toUpperCase();

  return (
    <div className="widget-kardex-estudiante">
      <section className="widget-kardex-estudiante-tabla-zona">
        <header className="widget-kardex-estudiante-encabezado">
          <div className={'widget-kardex-estudiante-avatar' + (alumno.genero === 'mujer' ? ' widget-kardex-estudiante-avatar-mujer' : '')}>{iniciales}</div>
          <div className="widget-kardex-estudiante-identidad">
            <h2>{nombreCompleto(alumno)}</h2>
            <div className="widget-kardex-estudiante-insignias">
              <BadgeDinamico texto={alumno.matricula} icono="ri-id-card-line" tono="gris" title="Matrícula" />
              <BadgeDinamico texto={alumno.activo === false ? 'Inactivo' : 'Activo'} tono={alumno.activo === false ? 'rojo' : 'verde'} />
            </div>
          </div>
          <div className="widget-kardex-estudiante-resumen">
            <span>Promedio general</span>
            <strong>{formatoPromedio(kardex?.promedioGeneral ?? null)}</strong>
            <small>{kardex?.totalMaterias ?? 0} {kardex?.totalMaterias === 1 ? 'materia' : 'materias'}</small>
          </div>
          <MencionHonorifica alumno={alumno} />
          <dl className="widget-kardex-estudiante-datos">
            <div><dt>Programa</dt><dd>{nombreDeCatalogo(PROGRAMAS_EDUCATIVOS, grupo?.programaEducativo) || '—'}</dd></div>
            <div><dt>Grupo</dt><dd>{grupo?.nombre ?? '—'}</dd></div>
            <div><dt>Tiempo</dt><dd>{nombreDeCatalogo(TIEMPOS, alumno.tiempo) || '—'}</dd></div>
            <div><dt>Modalidad</dt><dd>{nombreDeCatalogo(MODALIDADES, grupo?.modalidad) || '—'}</dd></div>
          </dl>
        </header>
        {cuatrimestres.length > 0 && (
          <div className="widget-kardex-estudiante-filtro">
            <ListaExpandible
              valorActual={vigente}
              etiquetaActual={vigente === TODOS ? 'Todos los cuatrimestres' : nombreCuatrimestre(vigente)}
              opciones={[{ id: TODOS, label: 'Todos los cuatrimestres' }, ...cuatrimestres.map((c) => ({ id: c.numero, label: nombreCuatrimestre(c.numero) }))]}
              onSeleccionar={setFiltro}
            />
          </div>
        )}
        <div className="widget-kardex-estudiante-tabla-wrap">
          <div className="widget-kardex-estudiante-tabla" ref={contenedorRef} onScroll={onScroll}>
            {cuatrimestres.length === 0 ? (
              <p className="widget-kardex-estudiante-vacio">Sin calificaciones. Usa el «+» del estudiante en la lista para capturarlas.</p>
            ) : (
              <table>
                <thead>
                  <tr><th className="widget-kardex-estudiante-th-todos" onClick={alternarTodos} title={todosAbiertos ? 'Colapsar todos' : 'Expandir todos'}><i className={todosAbiertos ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'} />Clave</th><th>Materia</th><th className="widget-kardex-estudiante-cal">Calif.</th><th>Observaciones</th><th className="widget-kardex-estudiante-acciones" aria-label="Acciones"></th></tr>
                </thead>
                {visibles.map((c) => (
                  <tbody key={c.numero}>
                    <tr className={'widget-kardex-estudiante-cuatri' + (completo(c) ? ' widget-kardex-estudiante-cuatri-completo' : '')} onClick={() => alternar(c.numero)}>
                      <td colSpan={5}>
                        <div className="widget-kardex-estudiante-cuatri-fila">
                          <span>
                            <i className={abierto(c) ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'} />
                            {nombreCuatrimestre(c.numero)}
                            <small>{calificadas(c)} de {totalDe(c.numero)}</small>
                          </span>
                          <BadgeDinamico texto={`Promedio ${formatoPromedio(c.promedio)}`} tono={c.promedio >= CALIFICACION_APROBATORIA ? 'azul' : 'rojo'} />
                        </div>
                      </td>
                    </tr>
                    {abierto(c) && c.materias.map((m) => {
                      const materia = materiaDe.get(m.materia);
                      return (
                        <tr key={m.registroId ?? `${m.cicloId}:${m.materia}`}>
                          <td className="widget-kardex-estudiante-clave">{materia?.clave}</td>
                          <td className="widget-kardex-estudiante-materia">
                            {materia?.nombre ?? m.materia}
                            {m.cicloId && <span className="widget-kardex-estudiante-ciclo">Ciclo {m.cicloId}</span>}
                          </td>
                          <td className={'widget-kardex-estudiante-cal ' + (m.calificacion >= CALIFICACION_APROBATORIA ? 'widget-kardex-estudiante-aprobada' : 'widget-kardex-estudiante-reprobada')}>{textoCalificacion(m)}</td>
                          <td className="widget-kardex-estudiante-obs">{observacionKardex(m)}</td>
                          <td className="widget-kardex-estudiante-acciones">
                            {puedeEditar && m.registroId && !sidebar3Abierto && (
                              <div className="widget-kardex-estudiante-opciones">
                              <OpcionesRegistro
                                descripcion={`la calificación de ${materia?.nombre ?? m.materia}`}
                                onEditar={() => abrirEdicionRegistro(m.registroId)}
                                onEliminar={() => eliminarCalificacionKardex(m.registroId)}
                              />
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                ))}
              </table>
            )}
          </div>
          {thumb.visible && (
            <div
              className="widget-kardex-estudiante-thumb"
              style={{ height: thumb.alto, top: thumb.top }}
              onMouseDown={onArrastrarThumb}
            />
          )}
        </div>
      </section>
      {!sidebar3Abierto && <VistaPreviaKardex />}
    </div>
  );
}

const ROL_FIRMA_MENCION = 'director';

function MencionHonorifica({ alumno }) {
  const { MENCIONES, PLANTEL, PERSONAL, ROLES, otorgarMencion, revocarMencion } = useRegistros();
  const { rolesSesion, rolActivo } = useAuth();
  const superusuario = esAdministradorTI(rolesSesion.filter(rolActivo));
  const [modal, setModal] = useState(null);
  const [fecha, setFecha] = useState(hoyLocal());
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [documento, setDocumento] = useState('');
  const [impresiones, setImpresiones] = useState(0);
  const iframeRef = useRef(null);
  const mencion = MENCIONES.find((m) => m.estudianteId === alumno.id);
  if (!mencion && !superusuario) return null;

  function cerrar() {
    setModal(null);
    setError(null);
  }

  async function ejecutar(operacion) {
    setOcupado(true);
    setError(null);
    try {
      await operacion();
      cerrar();
    } catch (e) {
      setError(e?.mensaje ?? 'No se pudo completar la operación.');
    } finally {
      setOcupado(false);
    }
  }

  function imprimir() {
    const firmante = PERSONAL.find((p) => p.activo !== false && (p.roles ?? []).includes(ROL_FIRMA_MENCION));
    const nombre = nombreCompleto(alumno);
    setImpresiones((n) => n + 1);
    setDocumento(documentoMencion({
      titulo: `Constancia_Mencion_Honorifica_${alumno.nombre.split(' ')[0]}_${alumno.primerApellido}`.replace(/\s+/g, '_'),
      menciones: [{ nombre, fecha: mencion.fecha }],
      institucion: PLANTEL?.institucion ?? '',
      lugar: PLANTEL?.municipio ?? '',
      firma: { nombre: firmante ? nombreCompleto(firmante) : '', cargo: ROLES.find((r) => r.id === ROL_FIRMA_MENCION)?.nombre ?? '' },
      logo: new URL(logoIcom, window.location.href).href,
    }));
  }

  return (
    <div className="widget-kardex-estudiante-mencion">
      {mencion ? (
        <>
          <BadgeDinamico texto="Mención honorífica" icono="ri-award-fill" tono="naranja" title={`Folio ${mencion.folio}`} />
          <BotonS variant="claro" onClick={imprimir}><i className="ri-file-pdf-2-line" /> Imprimir mención</BotonS>
          {superusuario && <BotonS variant="claro" onClick={() => setModal('revocar')}>Revocar</BotonS>}
        </>
      ) : (
        <BotonS variant="claro" onClick={() => { setFecha(hoyLocal()); setModal('otorgar'); }}><i className="ri-award-line" /> Otorgar mención honorífica</BotonS>
      )}
      <Modal abierto={modal === 'otorgar'} titulo="Otorgar mención honorífica" onCerrar={cerrar}>
        <p className="widget-kardex-estudiante-modal-texto">{`Mención honorífica por titulación para ${nombreCompleto(alumno)}. Fecha de la constancia:`}</p>
        <CampoTexto tipo="date" value={fecha} onChange={setFecha} ariaLabel="Fecha de la mención" />
        {error && <p className="widget-kardex-estudiante-modal-error">{error}</p>}
        <div className="widget-kardex-estudiante-modal-acciones">
          <BotonS variant="claro" onClick={cerrar}>Cancelar</BotonS>
          <BotonS variant="claro" disabled={ocupado || !fecha} onClick={() => ejecutar(() => otorgarMencion({ estudianteId: alumno.id, fecha }))}>Otorgar</BotonS>
        </div>
      </Modal>
      <Modal abierto={modal === 'revocar'} titulo="Revocar mención honorífica" onCerrar={cerrar}>
        <p className="widget-kardex-estudiante-modal-texto">{`¿Revocar la mención honorífica de ${nombreCompleto(alumno)} (folio ${mencion?.folio ?? ''})? El folio no se reutiliza.`}</p>
        {error && <p className="widget-kardex-estudiante-modal-error">{error}</p>}
        <div className="widget-kardex-estudiante-modal-acciones">
          <BotonS variant="claro" onClick={cerrar}>Cancelar</BotonS>
          <BotonS variant="claro" disabled={ocupado} onClick={() => ejecutar(() => revocarMencion(mencion.id))}>Revocar</BotonS>
        </div>
      </Modal>
      {documento && (
        <iframe
          key={impresiones}
          ref={iframeRef}
          className="widget-kardex-estudiante-impresion"
          title="Mención honorífica para imprimir"
          srcDoc={documento}
          onLoad={() => imprimirDocumento(iframeRef.current?.contentWindow)}
        />
      )}
    </div>
  );
}
