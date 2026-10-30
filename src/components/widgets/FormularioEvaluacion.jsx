import { useEffect, useState } from 'react';
import CampoFormulario from '../base/CampoFormulario.jsx';
import CampoTexto from '../base/CampoTexto.jsx';
import Checkbox from '../base/Checkbox.jsx';
import Textarea from '../base/Textarea.jsx';
import BotonS from '../base/BotonS.jsx';
import MarcoFormulario from './MarcoFormulario.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { filtrarPersonas, nombreCompleto, registroActivo } from '../../utils/registros.js';
import { ajustarCalificacion, evaluacionDe, materiasDelPrograma } from '../../utils/evaluaciones.js';
import '../../styles/widgets/FormularioEvaluacion.css';

function desdeEvaluacion(evaluacion) {
  return {
    calificaciones: Object.fromEntries((evaluacion?.calificaciones ?? []).map((c) => [c.materia, String(c.calificacion)])),
    observaciones: evaluacion?.observaciones ?? '',
  };
}

function igual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function Captura({ alumno, cicloId, evaluacion, materias }) {
  const { guardarEvaluacion, guardarBorrador, obtenerBorrador, eliminarBorrador } = useRegistros();
  const [base] = useState(() => desdeEvaluacion(evaluacion));
  const clave = `formularioEvaluacion:${cicloId}:${alumno.id}`;
  const [form, setForm] = useState(base);
  const [restaurado, setRestaurado] = useState(false);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
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
  }, [clave, obtenerBorrador]);

  useEffect(() => {
    if (!restaurado) return undefined;
    const temporizador = setTimeout(() => {
      (igual(form, base) ? eliminarBorrador(clave) : guardarBorrador(clave, form)).catch(() => {});
    }, 400);
    return () => clearTimeout(temporizador);
  }, [form, restaurado, base, clave, guardarBorrador, eliminarBorrador]);

  function cambiar(cambios) {
    setForm((f) => ({ ...f, ...cambios }));
    setError(null);
  }

  function marcar(materia, marcada) {
    const calificaciones = { ...form.calificaciones };
    if (marcada) calificaciones[materia] = calificaciones[materia] || '10';
    else delete calificaciones[materia];
    cambiar({ calificaciones });
  }

  const marcadas = materias.filter((m) => m.id in form.calificaciones);
  const completas = marcadas.length > 0 && marcadas.every((m) => form.calificaciones[m.id] !== '');
  const puedeConfirmar = restaurado && completas && !igual(form, base) && !ocupado;

  function descartar() {
    setForm(base);
    setError(null);
    eliminarBorrador(clave).catch(() => {});
  }

  async function confirmar() {
    setOcupado(true);
    setError(null);
    await eliminarBorrador(clave).catch(() => {});
    try {
      await guardarEvaluacion(alumno.id, cicloId, {
        calificaciones: marcadas.map((m) => ({ materia: m.id, calificacion: Number(form.calificaciones[m.id]) })),
        observaciones: form.observaciones,
      });
    } catch (e) {
      guardarBorrador(clave, form).catch(() => {});
      setError(e?.mensaje ?? 'No se pudo guardar la evaluación.');
      setOcupado(false);
    }
  }

  return (
    <MarcoFormulario
      error={error}
      textoConfirmar="Guardar"
      puedeConfirmar={puedeConfirmar}
      onCancelar={descartar}
      onConfirmar={confirmar}
    >
      <CampoFormulario etiqueta="Alumno(a)">
        <CampoTexto value={nombreCompleto(alumno)} disabled />
      </CampoFormulario>
      <CampoFormulario etiqueta="Materias y calificaciones" requerido>
        <div className="widget-formulario-evaluacion-materias">
          {materias.map((m) => {
            const marcada = m.id in form.calificaciones;
            return (
              <div key={m.id} className="widget-formulario-evaluacion-materia">
                <Checkbox checked={marcada} label={m.nombre} onChange={(v) => marcar(m.id, v)} />
                <div className="widget-formulario-evaluacion-calificacion">
                  <CampoTexto
                    tipo="number"
                    value={form.calificaciones[m.id] ?? ''}
                    disabled={!marcada}
                    placeholder="–"
                    ariaLabel={`Calificación de ${m.nombre}`}
                    onChange={(v) => cambiar({ calificaciones: { ...form.calificaciones, [m.id]: ajustarCalificacion(v) } })}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CampoFormulario>
      <CampoFormulario etiqueta="Observaciones">
        <Textarea value={form.observaciones} onChange={(v) => cambiar({ observaciones: v })} placeholder="Observaciones del alumno(a)…" />
      </CampoFormulario>
    </MarcoFormulario>
  );
}

export default function FormularioEvaluacion() {
  const { ESTUDIANTES, GRUPOS, EVALUACIONES, MATERIAS, cicloActivoId, CARGA } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, abrirPanelControl } = useUI();
  const alumno = registroActivo(filtrarPersonas(ESTUDIANTES, terminoBusqueda), registroSeleccionadoId);

  let mensaje = null;
  if (!cicloActivoId) mensaje = 'Crea la calendarización anual de ciclos escolares para poder capturar evaluaciones.';
  else if (!alumno) mensaje = CARGA.estudiantes.cargando ? 'Cargando…' : 'Elige un estudiante de la lista.';

  if (mensaje) {
    return (
      <div className="widget-formulario-evaluacion-mensaje">
        <p>{mensaje}</p>
        {!cicloActivoId && <BotonS variant="claro" onClick={() => abrirPanelControl('calendarizacion')}>Ir al Panel de control</BotonS>}
      </div>
    );
  }

  const grupo = GRUPOS.find((g) => g.id === alumno.grupo);
  if (!grupo) {
    return <div className="widget-formulario-evaluacion-mensaje"><p>Asigna un grupo a este estudiante para poder capturar sus calificaciones.</p></div>;
  }
  const materias = materiasDelPrograma(MATERIAS, grupo.programaEducativo);
  if (materias.length === 0) {
    return <div className="widget-formulario-evaluacion-mensaje"><p>El programa educativo del grupo de este estudiante aún no tiene materias.</p></div>;
  }

  const evaluacion = evaluacionDe(EVALUACIONES, alumno.id, cicloActivoId);
  return (
    <Captura
      key={`${cicloActivoId}:${alumno.id}:${evaluacion?.version ?? 0}`}
      alumno={alumno}
      cicloId={cicloActivoId}
      evaluacion={evaluacion}
      materias={materias}
    />
  );
}
