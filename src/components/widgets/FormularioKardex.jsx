import { useEffect, useState } from 'react';
import CampoFormulario from '../base/CampoFormulario.jsx';
import CampoTexto from '../base/CampoTexto.jsx';
import ListaExpandible from '../base/ListaExpandible.jsx';
import Textarea from '../base/Textarea.jsx';
import MarcoFormulario from './MarcoFormulario.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { filtrarEstudiantes, registroActivo, segunEstado } from '../../utils/registros.js';
import { CALIFICACION_MAXIMA, CALIFICACION_MINIMA, ajustarCalificacion, calificacionValida } from '../../utils/evaluaciones.js';
import { cuatrimestresDe, nombreCuatrimestre } from '../../utils/planEstudios.js';
import { acreditadasFuera } from '../../utils/kardex.js';
import '../../styles/widgets/FormularioKardex.css';

const VACIO = { cuatrimestre: 1, materia: '', calificacion: '', observaciones: '' };

function igual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function Captura({ alumno, materias, registro }) {
  const { CALIFICACIONES_KARDEX, KARDEX, crearCalificacionKardex, editarCalificacionKardex, guardarBorrador, obtenerBorrador, eliminarBorrador } = useRegistros();
  const { cerrarSidebar3 } = useUI();
  const clave = `formularioKardex:${alumno.id}`;
  const editandoId = registro?.id ?? null;
  const [inicial] = useState(() => {
    const ocupadas = new Set([...CALIFICACIONES_KARDEX.filter((c) => c.estudianteId === alumno.id).map((c) => c.materia), ...acreditadasFuera(KARDEX.find((k) => k.estudianteId === alumno.id), null)]);
    const primera = materias.find((m) => !ocupadas.has(m.id));
    return primera ? { ...VACIO, cuatrimestre: primera.cuatrimestre, materia: primera.id } : VACIO;
  });
  const [form, setForm] = useState(() => (registro ? {
    cuatrimestre: materias.find((m) => m.id === registro.materia)?.cuatrimestre ?? 1,
    materia: registro.materia,
    calificacion: String(registro.calificacion),
    observaciones: registro.observaciones,
  } : inicial));
  const [restaurado, setRestaurado] = useState(!!registro);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [focos, setFocos] = useState(1);
  const capturadas = CALIFICACIONES_KARDEX.filter((c) => c.estudianteId === alumno.id);
  const registradas = new Set([...capturadas.map((c) => c.materia), ...acreditadasFuera(KARDEX.find((k) => k.estudianteId === alumno.id), null)]);
  const cuatrimestres = cuatrimestresDe(materias);
  const delCuatrimestre = materias.filter((m) => m.cuatrimestre === form.cuatrimestre);
  const pendientes = delCuatrimestre.filter((m) => !registradas.has(m.id));
  const nombreDe = (id) => materias.find((m) => m.id === id)?.nombre ?? id;

  useEffect(() => {
    if (editandoId) return undefined;
    let cancelado = false;
    obtenerBorrador(clave)
      .catch(() => null)
      .then((borrador) => {
        if (cancelado) return;
        if (borrador) setForm(borrador);
        setRestaurado(true);
      });
    return () => {
      cancelado = true;
    };
  }, [clave, obtenerBorrador, editandoId]);

  useEffect(() => {
    if (!restaurado || editandoId) return undefined;
    const temporizador = setTimeout(() => {
      (igual(form, inicial) ? eliminarBorrador(clave) : guardarBorrador(clave, form)).catch(() => {});
    }, 400);
    return () => clearTimeout(temporizador);
  }, [form, inicial, restaurado, editandoId, clave, guardarBorrador, eliminarBorrador]);

  function cambiar(cambios) {
    setForm((f) => ({ ...f, ...cambios }));
    setError(null);
  }

  function enfocar() {
    setFocos((n) => n + 1);
  }

  function elegirCuatrimestre(numero) {
    const siguiente = materias.find((m) => m.cuatrimestre === numero && !registradas.has(m.id));
    cambiar({ cuatrimestre: numero, materia: siguiente?.id ?? '' });
    enfocar();
  }

  function cancelar() {
    if (!editandoId) eliminarBorrador(clave).catch(() => {});
    cerrarSidebar3();
  }

  const materiaOcupada = !editandoId && registradas.has(form.materia);
  const fueraDeRango = form.calificacion !== '' && !calificacionValida(form.calificacion);
  const puedeConfirmar = restaurado && form.materia && !materiaOcupada && calificacionValida(form.calificacion) && !ocupado;

  async function confirmar() {
    if (!puedeConfirmar) return;
    setOcupado(true);
    setError(null);
    const datos = { materia: form.materia, calificacion: Number(form.calificacion), observaciones: form.observaciones };
    try {
      if (editandoId) {
        await editarCalificacionKardex(editandoId, datos);
        cerrarSidebar3();
        return;
      } else {
        await crearCalificacionKardex({ estudianteId: alumno.id, ...datos });
        const siguiente = pendientes.find((m) => m.id !== form.materia);
        setForm({ ...VACIO, cuatrimestre: form.cuatrimestre, materia: siguiente?.id ?? '' });
        eliminarBorrador(clave).catch(() => {});
      }
      enfocar();
    } catch (e) {
      setError(e?.mensaje ?? 'No se pudo guardar la calificación.');
    } finally {
      setOcupado(false);
    }
  }

  const opcionesMateria = (editandoId ? delCuatrimestre : pendientes).map((m) => ({ id: m.id, label: `${m.clave} · ${m.nombre}` }));

  return (
    <MarcoFormulario
      error={error}
      textoConfirmar={editandoId ? 'Guardar' : 'Registrar'}
      puedeConfirmar={puedeConfirmar}
      onCancelar={cancelar}
      onConfirmar={confirmar}
    >
      {editandoId && <p className="widget-formulario-kardex-aviso">Editando {nombreDe(form.materia)}</p>}
      <CampoFormulario etiqueta="Cuatrimestre" requerido medio>
        {editandoId ? (
          <CampoTexto value={nombreCuatrimestre(form.cuatrimestre)} disabled />
        ) : (
          <ListaExpandible
            valorActual={form.cuatrimestre}
            etiquetaActual={nombreCuatrimestre(form.cuatrimestre)}
            opciones={cuatrimestres.map((c) => ({ id: c.numero, label: nombreCuatrimestre(c.numero) }))}
            onSeleccionar={elegirCuatrimestre}
          />
        )}
      </CampoFormulario>
      <CampoFormulario etiqueta="Materia" requerido medio error={materiaOcupada ? 'Ya tiene calificación: edítala en la tabla.' : null}>
        {editandoId ? (
          <CampoTexto value={nombreDe(form.materia)} disabled ariaLabel="Materia" />
        ) : (
          <div className="widget-formulario-kardex-campo">
          <ListaExpandible
            valorActual={form.materia}
            etiquetaActual={<span className="widget-formulario-kardex-etiqueta">{form.materia ? nombreDe(form.materia) : (pendientes.length ? 'Selecciona…' : 'Cuatrimestre completo')}</span>}
            opciones={opcionesMateria}
            onSeleccionar={(id) => { cambiar({ materia: id }); enfocar(); }}
          />
          </div>
        )}
      </CampoFormulario>
      <CampoFormulario etiqueta="Calificación" requerido error={fueraDeRango ? `De ${CALIFICACION_MINIMA} a ${CALIFICACION_MAXIMA}.` : null}>
        <CampoTexto
          value={form.calificacion}
          onChange={(v) => cambiar({ calificacion: ajustarCalificacion(v) })}
          onEnter={confirmar}
          placeholder={`${CALIFICACION_MINIMA} a ${CALIFICACION_MAXIMA}`}
          ariaLabel="Calificación"
          enfocar={focos}
        />
      </CampoFormulario>
      <CampoFormulario etiqueta="Observaciones">
        <div className="widget-formulario-kardex-texto">
          <Textarea value={form.observaciones} onChange={(v) => cambiar({ observaciones: v })} placeholder="Opcional" />
        </div>
      </CampoFormulario>
    </MarcoFormulario>
  );
}

export default function FormularioKardex() {
  const { ESTUDIANTES, GRUPOS, MATERIAS, CALIFICACIONES_KARDEX, CARGA } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, filtroEstado, registroEnEdicionId, sidebar3Abierto } = useUI();
  const alumno = registroActivo(segunEstado(filtrarEstudiantes(ESTUDIANTES, GRUPOS, terminoBusqueda), filtroEstado), registroSeleccionadoId);

  if (!alumno) {
    return (
      <div className="widget-formulario-kardex-mensaje">
        <i className="ri-user-search-line" aria-hidden="true"></i>
        <p>{CARGA.estudiantes.cargando ? 'Cargando…' : 'Elige un estudiante de la lista para capturar su kárdex.'}</p>
      </div>
    );
  }
  const grupo = GRUPOS.find((g) => g.id === alumno.grupo);
  const materias = MATERIAS.filter((m) => m.programaEducativo === grupo?.programaEducativo);
  if (materias.length === 0) {
    return <div className="widget-formulario-kardex-mensaje"><p>El programa educativo del grupo de este estudiante no tiene materias en el plan de estudios.</p></div>;
  }
  const registro = registroEnEdicionId ? CALIFICACIONES_KARDEX.find((c) => c.id === registroEnEdicionId) ?? null : null;
  return <Captura key={`${alumno.id}:${registroEnEdicionId ?? 'nueva'}:${sidebar3Abierto}`} alumno={alumno} materias={materias} registro={registro} />;
}
