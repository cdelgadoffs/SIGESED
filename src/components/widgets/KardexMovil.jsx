import { useState } from 'react';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import CampoTexto from '../base/CampoTexto.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { filtrarEstudiantes, nombreCompleto, nombreDeCatalogo, ordenarPorTexto } from '../../utils/registros.js';
import { nombreCuatrimestre } from '../../utils/planEstudios.js';
import { CALIFICACION_APROBATORIA, formatoPromedio, observacionKardex, textoCalificacion } from '../../utils/kardex.js';
import '../../styles/widgets/KardexMovil.css';

const MAX_RESULTADOS = 30;

export default function KardexMovil() {
  const { ESTUDIANTES, GRUPOS, CARGA } = useRegistros();
  const { terminoBusqueda, setTerminoBusqueda, registroSeleccionadoId, setRegistroSeleccionadoId } = useUI();
  const alumno = ESTUDIANTES.find((e) => e.id === registroSeleccionadoId);

  if (alumno) {
    return (
      <div className="widget-kardex-movil">
        <button type="button" className="widget-kardex-movil-volver" onClick={() => setRegistroSeleccionadoId(null)}>
          <i className="ri-arrow-left-line" aria-hidden="true" /> Elegir otro estudiante
        </button>
        <Kardex alumno={alumno} />
      </div>
    );
  }

  const resultados = ordenarPorTexto(filtrarEstudiantes(ESTUDIANTES, GRUPOS, terminoBusqueda), nombreCompleto);
  return (
    <div className="widget-kardex-movil">
      <CampoTexto value={terminoBusqueda} onChange={setTerminoBusqueda} placeholder="Buscar por nombre, matrícula o grupo…" ariaLabel="Buscar estudiante" />
      {CARGA.estudiantes.cargando && <p className="widget-kardex-movil-mensaje">Cargando…</p>}
      {!CARGA.estudiantes.cargando && resultados.length === 0 && <p className="widget-kardex-movil-mensaje">Sin resultados.</p>}
      <div className="widget-kardex-movil-lista">
        {resultados.slice(0, MAX_RESULTADOS).map((e) => {
          const grupo = GRUPOS.find((g) => g.id === e.grupo);
          return (
            <button
              key={e.id}
              type="button"
              className="widget-kardex-movil-alumno"
              onClick={() => { setRegistroSeleccionadoId(e.id); setTerminoBusqueda(''); }}
            >
              <span className="widget-kardex-movil-alumno-textos">
                <span className="widget-kardex-movil-alumno-nombre">{nombreCompleto(e)}</span>
                <span className="widget-kardex-movil-alumno-detalle">{[e.matricula, grupo?.nombre].filter(Boolean).join(' · ')}</span>
              </span>
              {e.activo === false && <BadgeDinamico texto="Inactivo" tono="rojo" />}
            </button>
          );
        })}
      </div>
      {resultados.length > MAX_RESULTADOS && <p className="widget-kardex-movil-mensaje">{`Se muestran ${MAX_RESULTADOS} de ${resultados.length}. Escribe para afinar la búsqueda.`}</p>}
    </div>
  );
}

function Kardex({ alumno }) {
  const { GRUPOS, KARDEX, MATERIAS, PROGRAMAS_EDUCATIVOS, MODALIDADES } = useRegistros();
  const [alternados, setAlternados] = useState(() => new Set());
  const grupo = GRUPOS.find((g) => g.id === alumno.grupo);
  const kardex = KARDEX.find((k) => k.estudianteId === alumno.id);
  const materiaDe = new Map(MATERIAS.map((m) => [m.id, m]));
  const cuatrimestres = kardex?.cuatrimestres ?? [];
  const totalDe = (n) => MATERIAS.filter((m) => m.programaEducativo === grupo?.programaEducativo && m.cuatrimestre === n).length;
  const calificadas = (c) => c.materias.filter((m) => m.calificacion !== null).length;
  const completo = (c) => totalDe(c.numero) > 0 && calificadas(c) >= totalDe(c.numero);
  const abierto = (c) => (alternados.has(c.numero) ? completo(c) : !completo(c));
  const alternar = (n) => setAlternados((prev) => { const s = new Set(prev); if (s.has(n)) s.delete(n); else s.add(n); return s; });
  const iniciales = [alumno.nombre, alumno.primerApellido].map((t) => (t ?? '').trim()[0] ?? '').join('').toUpperCase();
  const inactivo = alumno.activo === false;
  const datos = [nombreDeCatalogo(PROGRAMAS_EDUCATIVOS, grupo?.programaEducativo), grupo?.nombre, nombreDeCatalogo(MODALIDADES, grupo?.modalidad)].filter(Boolean).join(' · ');

  return (
    <>
      <header className="widget-kardex-movil-encabezado">
        <div className="widget-kardex-movil-identidad">
          <div className={'widget-kardex-movil-avatar' + (alumno.genero === 'mujer' ? ' widget-kardex-movil-avatar-mujer' : '')}>{iniciales}</div>
          <div className="widget-kardex-movil-nombre">
            <h2>{nombreCompleto(alumno)}</h2>
            <div className="widget-kardex-movil-insignias">
              <BadgeDinamico texto={alumno.matricula} icono="ri-id-card-line" tono="gris" />
              <BadgeDinamico texto={inactivo ? 'Inactivo' : 'Activo'} tono={inactivo ? 'rojo' : 'verde'} />
            </div>
          </div>
        </div>
        <div className="widget-kardex-movil-pie">
          <span className="widget-kardex-movil-datos">{datos || '—'}</span>
          <span className="widget-kardex-movil-promedio">
            <strong>{formatoPromedio(kardex?.promedioGeneral ?? null)}</strong>
            <small>{`Promedio · ${kardex?.totalMaterias ?? 0} ${kardex?.totalMaterias === 1 ? 'materia' : 'materias'}`}</small>
          </span>
        </div>
      </header>

      {cuatrimestres.length === 0 && <p className="widget-kardex-movil-mensaje">Sin calificaciones registradas.</p>}

      {cuatrimestres.map((c) => (
        <section key={c.numero} className={'widget-kardex-movil-cuatri' + (completo(c) ? ' widget-kardex-movil-cuatri-completo' : '')}>
          <button type="button" className="widget-kardex-movil-cuatri-cabeza" onClick={() => alternar(c.numero)}>
            <i className={abierto(c) ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'} aria-hidden="true" />
            <span className="widget-kardex-movil-cuatri-nombre">
              {nombreCuatrimestre(c.numero)}
              <small>{`${calificadas(c)} de ${totalDe(c.numero)}`}</small>
            </span>
            <BadgeDinamico texto={formatoPromedio(c.promedio)} tono={c.promedio >= CALIFICACION_APROBATORIA ? 'azul' : 'rojo'} />
          </button>
          {abierto(c) && (
            <ul className="widget-kardex-movil-materias">
              {c.materias.map((m) => {
                const materia = materiaDe.get(m.materia);
                const observacion = observacionKardex(m);
                return (
                  <li key={m.registroId ?? `${m.cicloId}:${m.materia}`}>
                    <div className="widget-kardex-movil-materia-textos">
                      <span className="widget-kardex-movil-materia-nombre">{materia?.nombre ?? m.materia}</span>
                      <span className="widget-kardex-movil-materia-detalle">{[materia?.clave, m.cicloId && `Ciclo ${m.cicloId}`].filter(Boolean).join(' · ')}</span>
                      {observacion && <span className="widget-kardex-movil-materia-obs">{observacion}</span>}
                    </div>
                    <span className={'widget-kardex-movil-cal ' + (m.calificacion >= CALIFICACION_APROBATORIA ? 'widget-kardex-movil-aprobada' : 'widget-kardex-movil-reprobada')}>{textoCalificacion(m)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}

      <p className="widget-kardex-movil-mensaje">El PDF del kárdex se genera en la versión de escritorio.</p>
    </>
  );
}
