import { useEffect, useState } from 'react';
import CampoFormulario from '../base/CampoFormulario.jsx';
import CampoTexto from '../base/CampoTexto.jsx';
import ListaExpandible from '../base/ListaExpandible.jsx';
import BotonIcono from '../base/BotonIcono.jsx';
import BotonS from '../base/BotonS.jsx';
import Checkbox from '../base/Checkbox.jsx';
import MarcoFormulario from './MarcoFormulario.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { esAdministradorTI } from '../../utils/permisos.js';
import { DIAS_SEMANA } from '../../utils/fechas.js';
import { nombreCompleto, ordenarPorTexto, filtrarEstudiantes } from '../../utils/registros.js';
import {
  HORAS_POR_MATERIA, MATERIAS_POR_GRUPO, NUEVO_PERSONALIZADO, clasesDeOtrosGrupos, claseDeOtroGrupo, textoHorario, cursaronAntes, diasDeHorario, horasDeModalidad, inscripcionDe, puedeImpartir, tipoHorario,
} from '../../utils/inscripciones.js';
import '../../styles/widgets/FormularioInscripcion.css';

const clave = (dia, hora) => `${dia}:${hora}`;
const sinCero = (hora) => hora.replace(/^0/, '');

function CuadriculaHorario({ horas, dias, propias, ocupadas, onAlternar, maxHoras, bloqueada }) {
  const llena = propias.size >= maxHoras;
  return (
    <table className="widget-formulario-inscripcion-cuadricula">
      <thead>
        <tr>
          <th>Hora</th>
          {dias.map((d) => <th key={d}>{DIAS_SEMANA[d].slice(0, 3)}</th>)}
        </tr>
      </thead>
      <tbody>
        {horas.map((h) => (h.descanso ? (
          <tr key={h.id} className="widget-formulario-inscripcion-receso">
            <td>{`${sinCero(h.inicio)}–${sinCero(h.fin)}`}</td>
            <td colSpan={dias.length}>{h.nombre}</td>
          </tr>
        ) : (
          <tr key={h.id}>
            <td>
              <span className="widget-formulario-inscripcion-hora">{`${h.numero}ª`}</span>
              {`${sinCero(h.inicio)}–${sinCero(h.fin)}`}
            </td>
            {dias.map((d) => {
              const k = clave(d, h.id);
              const propia = propias.has(k);
              const otra = ocupadas.get(k);
              return (
                <td key={d}>
                  <button
                    type="button"
                    className={`widget-formulario-inscripcion-celda widget-formulario-inscripcion-dia-${d}` + (otra ? ' widget-formulario-inscripcion-celda-ocupada' : '') + (propia ? ' widget-formulario-inscripcion-celda-propia' : '')}
                    disabled={bloqueada || !!otra || (llena && !propia)}
                    title={otra ? `Ocupada por ${otra}` : undefined}
                    aria-label={`${DIAS_SEMANA[d]}, ${h.nombre}`}
                    aria-pressed={propia}
                    onClick={() => onAlternar(d, h.id)}
                  >
                    {propia ? <i className="ri-check-line" /> : (otra ?? '')}
                  </button>
                </td>
              );
            })}
          </tr>
        )))}
      </tbody>
    </table>
  );
}

const CUATRIMESTRES = 9;
const NUEVA = '__nueva';

function sinHorariosViejos(form) {
  return { ...form, materias: form.materias.map((m) => ({ ...m, horario: (m.horario ?? []).filter((b) => b.hora) })) };
}

const MATERIA_VACIA = { cuatrimestre: null, materia: '', docenteId: '', horario: [] };

function desdeInscripcion(inscripcion, materias, cantidad = MATERIAS_POR_GRUPO) {
  const guardadas = inscripcion?.materias ?? [];
  return {
    materias: Array.from({ length: cantidad }, (_, i) => {
      const m = guardadas[i];
      if (!m) return { ...MATERIA_VACIA };
      return {
        cuatrimestre: materias.find((x) => x.id === m.materia)?.cuatrimestre ?? null,
        materia: m.materia,
        docenteId: m.docenteId ?? '',
        horario: m.horario.map((b) => ({ dia: b.dia, hora: b.hora })),
      };
    }),
  };
}

function igual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function Inscripcion({ ciclo, grupo, inscripcion, personalizada, libre, ocupadosEnOtros }) {
  const {
    MATERIAS, MODALIDADES, HORAS_CLASE, PERSONAL, ESTUDIANTES, EVALUACIONES, GRUPOS, INSCRIPCIONES,
    crearMateria, guardarInscripcion, guardarHorarioPersonalizado, guardarBorrador, obtenerBorrador, eliminarBorrador,
  } = useRegistros();
  const { setGrupoEnInscripcionId } = useUI();
  const delPrograma = MATERIAS.filter((m) => m.programaEducativo === grupo.programaEducativo);
  const [base] = useState(() => {
    if (!libre) return desdeInscripcion(inscripcion, delPrograma);
    const origen = personalizada ?? inscripcion;
    return { ...desdeInscripcion(origen, delPrograma, Math.max(origen?.materias.length ?? 0, 1)), estudiantes: personalizada?.estudiantes ?? [] };
  });
  const maxHoras = libre ? Infinity : HORAS_POR_MATERIA;
  const claveBorrador = libre
    ? `formularioInscripcion:${ciclo.id}:${grupo.id}:${personalizada?.id ?? NUEVO_PERSONALIZADO}`
    : `formularioInscripcion:${ciclo.id}:${grupo.id}`;
  const [form, setForm] = useState(base);
  const [restaurado, setRestaurado] = useState(false);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const tipo = tipoHorario(grupo, MODALIDADES);
  const horas = horasDeModalidad(HORAS_CLASE, grupo);
  const dias = diasDeHorario(tipo);
  const alumnos = libre
    ? ESTUDIANTES.filter((e) => form.estudiantes.includes(e.id))
    : ESTUDIANTES.filter((e) => e.grupo === grupo.id && e.activo !== false);
  const docentes = ordenarPorTexto(PERSONAL.filter(puedeImpartir), nombreCompleto);
  const cuatrimestres = Array.from({ length: CUATRIMESTRES }, (_, i) => i + 1);
  const [nuevas, setNuevas] = useState({});
  const [agregando, setAgregando] = useState(false);
  const [filtroAlumnos, setFiltroAlumnos] = useState('');
  const clasesOtros = libre ? clasesDeOtrosGrupos(INSCRIPCIONES, GRUPOS, ciclo.id, grupo) : [];

  function opcionesOtroGrupo(i) {
    const m = form.materias[i];
    const otras = form.materias.filter((_, j) => j !== i).map((x) => x.materia);
    const ocupadas = ocupadasPorOtras(i);
    const propias = new Set(m.horario.map((b) => clave(b.dia, b.hora)));
    const disponibles = clasesOtros.filter((c) => !otras.includes(c.materia) && c.horario.every((b) => !ocupadas.has(clave(b.dia, b.hora))));
    const aEsaHora = propias.size > 0 && !claseDeOtroGrupo(clasesOtros, m)
      ? disponibles.filter((c) => c.horario.some((b) => propias.has(clave(b.dia, b.hora))))
      : [];
    return aEsaHora.length > 0 ? aEsaHora : disponibles;
  }

  function etiquetaClase(c) {
    const materia = MATERIAS.find((x) => x.id === c.materia);
    const docente = PERSONAL.find((p) => p.id === c.docenteId);
    return `${c.grupoNombre} · ${materia ? `${materia.clave} ${materia.nombre}` : c.materia} · ${docente ? nombreCompleto(docente) : 'Sin docente'} · ${textoHorario(c.horario, HORAS_CLASE)}`;
  }

  function tomarClase(i, c) {
    cambiarMateria(i, {
      cuatrimestre: MATERIAS.find((x) => x.id === c.materia)?.cuatrimestre ?? null,
      materia: c.materia,
      docenteId: c.docenteId,
      horario: c.horario.map((b) => ({ dia: b.dia, hora: b.hora })),
    });
  }

  function volverAlGrupo(i) {
    const enUso = form.materias.filter((_, j) => j !== i).map((x) => x.materia);
    const original = (inscripcion?.materias ?? []).find((x) => !enUso.includes(x.materia));
    if (!original) {
      cambiarMateria(i, { ...MATERIA_VACIA });
      return;
    }
    tomarClase(i, { materia: original.materia, docenteId: original.docenteId ?? '', horario: original.horario });
  }
  const elegibles = ESTUDIANTES.filter((e) => e.activo !== false || form.estudiantes?.includes(e.id));
  const listaAlumnos = libre ? [
    ...ordenarPorTexto(elegibles.filter((e) => form.estudiantes.includes(e.id)), nombreCompleto),
    ...ordenarPorTexto(filtrarEstudiantes(elegibles, GRUPOS, filtroAlumnos).filter((e) => !form.estudiantes.includes(e.id)), nombreCompleto),
  ] : [];

  async function agregarMateria(i, cuatrimestre) {
    setAgregando(true);
    setError(null);
    try {
      const creada = await crearMateria({ programaEducativo: grupo.programaEducativo, cuatrimestre, nombre: nuevas[i] ?? '' });
      setNuevas((n) => ({ ...n, [i]: undefined }));
      cambiarMateria(i, { materia: creada.id });
    } catch (e) {
      setError(e?.mensaje ?? 'No se pudo agregar la materia.');
    }
    setAgregando(false);
  }

  useEffect(() => {
    let cancelado = false;
    obtenerBorrador(claveBorrador)
      .catch(() => null)
      .then((borrador) => {
        if (cancelado) return;
        if (borrador) setForm(sinHorariosViejos(borrador));
        setRestaurado(true);
      });
    return () => {
      cancelado = true;
    };
  }, [claveBorrador, obtenerBorrador]);

  useEffect(() => {
    if (!restaurado) return undefined;
    const temporizador = setTimeout(() => {
      (igual(form, base) ? eliminarBorrador(claveBorrador) : guardarBorrador(claveBorrador, form)).catch(() => {});
    }, 400);
    return () => clearTimeout(temporizador);
  }, [form, restaurado, base, claveBorrador, guardarBorrador, eliminarBorrador]);

  function cambiarMateria(i, cambios) {
    setForm((f) => ({ ...f, materias: f.materias.map((m, j) => (j === i ? { ...m, ...cambios } : m)) }));
    setError(null);
  }

  function alternarHora(i, dia, hora) {
    const horario = form.materias[i].horario;
    const marcada = horario.some((b) => b.dia === dia && b.hora === hora);
    cambiarMateria(i, { horario: marcada ? horario.filter((b) => !(b.dia === dia && b.hora === hora)) : [...horario, { dia, hora }] });
  }

  function ocupadasPorOtras(i) {
    const mapa = new Map();
    form.materias.forEach((m, j) => {
      if (j === i || !m.materia) return;
      const claveMateria = delPrograma.find((x) => x.id === m.materia)?.clave ?? '•';
      m.horario.forEach((b) => mapa.set(clave(b.dia, b.hora), claveMateria));
    });
    return mapa;
  }

  function agregarFila() {
    setForm((f) => ({ ...f, materias: [...f.materias, { ...MATERIA_VACIA }] }));
  }

  function quitarFila(i) {
    if (!libre || form.materias.length === 1) cambiarMateria(i, { ...MATERIA_VACIA });
    else setForm((f) => ({ ...f, materias: f.materias.filter((_, j) => j !== i) }));
  }

  function alternarAlumno(id) {
    setForm((f) => ({ ...f, estudiantes: f.estudiantes.includes(id) ? f.estudiantes.filter((x) => x !== id) : [...f.estudiantes, id] }));
    setError(null);
  }

  const elegidas = form.materias.filter((m) => m.materia);
  const completo = !libre || (elegidas.length > 0 && form.estudiantes.length > 0);
  const puedeGuardar = restaurado && completo && (!igual(form, base) || (libre && !personalizada)) && !ocupado;

  function cerrar() {
    setGrupoEnInscripcionId(null);
  }

  function cancelar() {
    eliminarBorrador(claveBorrador).catch(() => {});
    cerrar();
  }

  async function guardar() {
    setOcupado(true);
    setError(null);
    await eliminarBorrador(claveBorrador).catch(() => {});
    try {
      const materias = elegidas.map((m) => ({
        materia: m.materia,
        docenteId: m.docenteId || null,
        horario: tipo === null ? [] : m.horario.map(({ dia, hora }) => ({ dia, hora })),
      }));
      if (libre) await guardarHorarioPersonalizado(ciclo.id, grupo.id, personalizada?.id ?? null, { materias, estudiantes: form.estudiantes });
      else await guardarInscripcion(ciclo.id, grupo.id, { materias });
      cerrar();
    } catch (e) {
      guardarBorrador(claveBorrador, form).catch(() => {});
      setError(e?.mensaje ?? 'No se pudo guardar la inscripción.');
      setOcupado(false);
    }
  }

  return (
    <MarcoFormulario
      error={error}
      textoConfirmar="Guardar"
      puedeConfirmar={puedeGuardar}
      onCancelar={cancelar}
      onConfirmar={guardar}
    >
      {libre ? (
        <>
          <CampoFormulario etiqueta={`Alumnos que lo toman (${form.estudiantes.length})`} requerido>
            <CampoTexto value={filtroAlumnos} placeholder="Buscar alumno por nombre, matrícula o grupo" onChange={setFiltroAlumnos} />
            {form.estudiantes.length === 0 && (
              <span className="widget-formulario-inscripcion-vacio">Marca al menos un alumno para poder guardar.</span>
            )}
            {listaAlumnos.length === 0 ? (
              <span className="widget-formulario-inscripcion-vacio">Ningún alumno coincide con la búsqueda.</span>
            ) : (
              <div className="widget-formulario-inscripcion-alumnos">
                {listaAlumnos.map((a) => {
                  const enOtro = ocupadosEnOtros.has(a.id);
                  const suGrupo = GRUPOS.find((g) => g.id === a.grupo)?.nombre;
                  return (
                    <Checkbox
                      key={a.id}
                      label={`${nombreCompleto(a)}${suGrupo ? ` · ${suGrupo}` : ''}${enOtro ? ' (en otro horario personalizado)' : ''}`}
                      checked={form.estudiantes.includes(a.id)}
                      disabled={enOtro}
                      onChange={() => alternarAlumno(a.id)}
                    />
                  );
                })}
              </div>
            )}
          </CampoFormulario>
        </>
      ) : null}
      {form.materias.map((m, i) => {
        const materia = delPrograma.find((x) => x.id === m.materia);
        const ocupadas = form.materias.filter((_, j) => j !== i).map((x) => x.materia);
        const opciones = delPrograma
          .filter((x) => x.cuatrimestre === m.cuatrimestre && !ocupadas.includes(x.id))
          .map((x) => {
            const n = cursaronAntes(x.id, alumnos, EVALUACIONES, ciclo.id).length;
            return { id: x.id, label: `${x.clave} · ${x.nombre}${n > 0 ? ` (ya la cursaron ${n})` : ''}` };
          });
        const cursaron = materia ? cursaronAntes(materia.id, alumnos, EVALUACIONES, ciclo.id) : [];
        const docente = PERSONAL.find((p) => p.id === m.docenteId);
        const prestada = libre ? claseDeOtroGrupo(clasesOtros, m) : null;
        const deOtros = libre && !prestada ? opcionesOtroGrupo(i) : [];
        let etiquetaDocente = 'Sin asignar';
        if (docente) etiquetaDocente = nombreCompleto(docente) + (puedeImpartir(docente) ? '' : ' (no disponible)');
        return (
          <div key={i} className="widget-formulario-inscripcion-materia">
            <div className="widget-formulario-inscripcion-materia-encabezado">
              <span>{`Materia ${i + 1}`}</span>
              {(m.materia || (libre && form.materias.length > 1)) && (
                <BotonIcono
                  icono="ri-delete-bin-line"
                  ariaLabel={`Quitar materia ${i + 1}`}
                  onClick={() => quitarFila(i)}
                />
              )}
            </div>
            {prestada && (
              <div className="widget-formulario-inscripcion-prestada">
                <span className="widget-formulario-inscripcion-prestada-badge"><i className="ri-arrow-left-right-line" />{` Clase de ${prestada.grupoNombre}`}</span>
                <span className="widget-formulario-inscripcion-prestada-texto">{etiquetaClase(prestada)}</span>
                <BotonS variant="claro" onClick={() => volverAlGrupo(i)}>Volver a la del grupo</BotonS>
              </div>
            )}
            {libre && !prestada && deOtros.length > 0 && (
              <CampoFormulario etiqueta="Tomar en otro grupo">
                <ListaExpandible
                  valorActual=""
                  etiquetaActual="Elige una clase de otro grupo…"
                  opciones={deOtros.map((c, n) => ({ id: n, label: etiquetaClase(c) }))}
                  onSeleccionar={(n) => tomarClase(i, deOtros[n])}
                />
              </CampoFormulario>
            )}
            {!prestada && (
            <div className="widget-formulario-inscripcion-fila">
              <CampoFormulario etiqueta="Cuatrimestre" medio>
                <ListaExpandible
                  valorActual={m.cuatrimestre}
                  etiquetaActual={m.cuatrimestre ? `${m.cuatrimestre}º` : 'Elige…'}
                  opciones={cuatrimestres.map((c) => ({ id: c, label: `Cuatrimestre ${c}` }))}
                  onSeleccionar={(c) => cambiarMateria(i, c === m.cuatrimestre ? {} : { cuatrimestre: c, materia: '' })}
                />
              </CampoFormulario>
              <CampoFormulario etiqueta="Materia" medio>
                {m.cuatrimestre ? (
                  <ListaExpandible
                    valorActual={nuevas[i] !== undefined ? NUEVA : m.materia}
                    etiquetaActual={nuevas[i] !== undefined ? 'Escribir materia nueva' : (materia ? `${materia.clave} · ${materia.nombre}` : 'Selecciona…')}
                    opciones={[...opciones, { id: NUEVA, label: '+ Escribir materia nueva' }]}
                    onSeleccionar={(id) => {
                      if (id === NUEVA) setNuevas((n) => ({ ...n, [i]: '' }));
                      else {
                        setNuevas((n) => ({ ...n, [i]: undefined }));
                        cambiarMateria(i, { materia: id });
                      }
                    }}
                  />
                ) : <CampoTexto value="" placeholder="Elige el cuatrimestre" disabled />}
              </CampoFormulario>
            </div>
            )}
            {m.cuatrimestre && nuevas[i] !== undefined && (
              <div className="widget-formulario-inscripcion-nueva">
                <CampoTexto
                  value={nuevas[i]}
                  placeholder={`Nombre de la materia (${m.cuatrimestre}º cuatrimestre)`}
                  enfocar
                  onChange={(v) => setNuevas((n) => ({ ...n, [i]: v }))}
                />
                <BotonS variant="claro" disabled={agregando || !nuevas[i].trim()} onClick={() => agregarMateria(i, m.cuatrimestre)}>Agregar</BotonS>
              </div>
            )}
            {cursaron.length > 0 && (
              <p className="widget-formulario-inscripcion-aviso">
                {`Ya la cursaron: ${cursaron.map(nombreCompleto).join(', ')}.`}
              </p>
            )}
            {m.materia && (
              <>
                {!prestada && (
                <CampoFormulario etiqueta="Docente">
                  {docentes.length === 0 && !docente ? (
                    <span className="widget-formulario-inscripcion-vacio">No hay personal activo con el rol Docente.</span>
                  ) : (
                    <ListaExpandible
                      valorActual={m.docenteId}
                      etiquetaActual={etiquetaDocente}
                      opciones={[{ id: '', label: 'Sin asignar' }, ...docentes.map((p) => ({ id: p.id, label: nombreCompleto(p) }))]}
                      onSeleccionar={(id) => cambiarMateria(i, { docenteId: id })}
                    />
                  )}
                </CampoFormulario>
                )}
                {tipo !== null && (
                  <CampoFormulario etiqueta={libre ? `Horario (${m.horario.length} ${m.horario.length === 1 ? 'hora' : 'horas'})` : `Horario (${m.horario.length} de máx. ${HORAS_POR_MATERIA} horas)`}>
                    <CuadriculaHorario
                      horas={horas}
                      dias={dias}
                      propias={new Set(m.horario.map((b) => clave(b.dia, b.hora)))}
                      ocupadas={ocupadasPorOtras(i)}
                      onAlternar={(d, h) => alternarHora(i, d, h)}
                      maxHoras={maxHoras}
                      bloqueada={!!prestada}
                    />
                  </CampoFormulario>
                )}
              </>
            )}
          </div>
        );
      })}
      {libre && (
        <div className="widget-formulario-inscripcion-agregar">
          <BotonS variant="claro" onClick={agregarFila}><i className="ri-add-line" /> Agregar materia</BotonS>
        </div>
      )}
    </MarcoFormulario>
  );
}

export default function FormularioInscripcion() {
  const { CICLOS, GRUPOS, INSCRIPCIONES, cicloActivoId } = useRegistros();
  const { grupoEnInscripcionId, horarioPersonalizadoId } = useUI();
  const { rolesSesion, rolActivo } = useAuth();
  const superusuario = esAdministradorTI(rolesSesion.filter(rolActivo));
  const ciclo = CICLOS.find((c) => c.id === cicloActivoId);
  const grupo = GRUPOS.find((g) => g.id === grupoEnInscripcionId);
  if (!ciclo || !grupo) return null;

  const abierto = CICLOS.find((c) => c.id !== ciclo.id && c.fechaInicio && !c.cerrado
    && (c.anio < ciclo.anio || (c.anio === ciclo.anio && c.numero < ciclo.numero)));
  let aviso = null;
  if (ciclo.cerrado) aviso = `El ciclo ${ciclo.id} ya se concluyó y no se puede modificar.`;
  else if (ciclo.iniciado) aviso = `El ciclo ${ciclo.id} ya se inició: sus inscripciones quedaron fijas.`;
  else if (abierto) aviso = `Primero concluye el ciclo ${abierto.id} (Panel de control › Calendarización anual) para poder preparar el ${ciclo.id}.`;
  else if (grupo.activo === false) aviso = `El grupo ${grupo.nombre} está inactivo: solo se inscriben grupos activos.`;
  const inscripcion = inscripcionDe(INSCRIPCIONES, ciclo.id, grupo.id);
  if (horarioPersonalizadoId) {
    if (ciclo.cerrado && !superusuario) return <p className="widget-formulario-inscripcion-aviso-general">{`El ciclo ${ciclo.id} ya se concluyó y no se puede modificar.`}</p>;
    const personalizada = horarioPersonalizadoId === NUEVO_PERSONALIZADO ? null : INSCRIPCIONES.find((i) => i.id === horarioPersonalizadoId) ?? null;
    if (horarioPersonalizadoId !== NUEVO_PERSONALIZADO && !personalizada) return null;
    const ocupadosEnOtros = new Set(INSCRIPCIONES
      .filter((i) => i.cicloId === ciclo.id && i.personalizada && i.id !== personalizada?.id)
      .flatMap((i) => i.estudiantes ?? []));
    return (
      <Inscripcion
        key={`${ciclo.id}:${grupo.id}:${horarioPersonalizadoId}:${personalizada?.version ?? 0}`}
        ciclo={ciclo}
        grupo={grupo}
        inscripcion={inscripcion}
        personalizada={personalizada}
        ocupadosEnOtros={ocupadosEnOtros}
        libre
      />
    );
  }
  if (aviso && !superusuario) return <p className="widget-formulario-inscripcion-aviso-general">{aviso}</p>;
  return <Inscripcion key={`${ciclo.id}:${grupo.id}:${inscripcion?.version ?? 0}`} ciclo={ciclo} grupo={grupo} inscripcion={inscripcion} />;
}
