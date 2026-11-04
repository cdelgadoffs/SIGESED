import { useState } from 'react';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import ListaExpandible from '../base/ListaExpandible.jsx';
import OpcionesRegistro from './OpcionesRegistro.jsx';
import VistaPreviaKardex from './VistaPreviaKardex.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
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
                            {m.registroId && !sidebar3Abierto && (
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
