import { useEffect, useState } from 'react';
import CampoFormulario from '../base/CampoFormulario.jsx';
import CampoTexto from '../base/CampoTexto.jsx';
import ListaExpandible from '../base/ListaExpandible.jsx';
import MarcoFormulario from './MarcoFormulario.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useFormularioRegistro } from '../../hooks/useFormularioRegistro.js';
import { nombreCompleto, ordenarPorTexto } from '../../utils/registros.js';
import { puedeImpartir } from '../../utils/inscripciones.js';
import { cicloParaNuevoCurso, reprobadosPorMateria } from '../../utils/cursos.js';
import { normalizarTexto } from '../../utils/texto.js';

const VACIO = { nombre: '', docenteId: '', materia: '', horaInicio: '10:00' };
const SIN_MATERIA = '';

export default function FormularioCurso() {
  const {
    CURSOS, PERSONAL, MATERIAS, KARDEX, ESTUDIANTES, CICLOS,
    crearCurso, editarCurso, guardarBorrador, obtenerBorrador, eliminarBorrador,
  } = useRegistros();
  const { sidebar3Abierto, registroEnEdicionId, cerrarSidebar3, setRegistroSeleccionadoId } = useUI();
  const registro = registroEnEdicionId ? CURSOS.find((c) => c.id === registroEnEdicionId) ?? null : null;
  const { form, setCampos, reiniciar, apertura } = useFormularioRegistro({
    vacio: VACIO, registro, abierto: sidebar3Abierto, claveBorrador: 'formularioCurso',
    guardarBorrador, obtenerBorrador, eliminarBorrador,
  });
  const [fallo, setFallo] = useState(null);
  const error = fallo && fallo.apertura === apertura ? fallo.mensaje : null;
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    if (registroEnEdicionId && !registro) cerrarSidebar3();
  }, [registroEnEdicionId, registro]);

  function cambiar(campo, valor) {
    setCampos({ [campo]: valor });
    setFallo(null);
  }

  const ciclo = registro
    ? CICLOS.find((c) => c.id === registro.cicloId)
    : cicloParaNuevoCurso(CICLOS);
  const docentes = ordenarPorTexto(PERSONAL.filter((p) => puedeImpartir(p) || p.id === form.docenteId), nombreCompleto);
  const docente = PERSONAL.find((p) => p.id === form.docenteId);
  const reprobados = reprobadosPorMateria(KARDEX, ESTUDIANTES);
  const materias = MATERIAS.filter((m) => reprobados.has(m.id) || m.id === form.materia);
  const etiquetaMateria = (m) => `${m.clave} · ${m.nombre}${reprobados.has(m.id) ? ` (${reprobados.get(m.id)})` : ''}`;
  const materia = MATERIAS.find((m) => m.id === form.materia);
  const cicloId = registro?.cicloId ?? ciclo?.id;
  const nombreRepetido = form.nombre.trim() && CURSOS.some((c) => c.id !== registro?.id && c.cicloId === cicloId
    && normalizarTexto(c.nombre).replace(/\s+/g, ' ') === normalizarTexto(form.nombre).replace(/\s+/g, ' '));
  const horaValida = /^([01]\d|2[0-3]):[0-5]\d$/.test(form.horaInicio) && Number(form.horaInicio.slice(0, 2)) <= 21;
  const puedeConfirmar = !!ciclo && !!form.nombre.trim() && !!form.docenteId && horaValida && !nombreRepetido && !ocupado;

  async function confirmar() {
    setOcupado(true);
    setFallo(null);
    const datos = { ...form, materia: form.materia || null };
    try {
      if (registro) {
        await editarCurso(registro.id, datos);
      } else {
        const nuevo = await crearCurso(datos);
        setRegistroSeleccionadoId(nuevo.id);
        reiniciar();
      }
      cerrarSidebar3();
    } catch (e) {
      setFallo({ apertura, mensaje: e?.mensaje ?? 'No se pudo guardar el curso.' });
    } finally {
      setOcupado(false);
    }
  }

  return (
    <MarcoFormulario
      error={error}
      textoConfirmar={registro ? 'Guardar' : 'Añadir'}
      puedeConfirmar={puedeConfirmar}
      onCancelar={cerrarSidebar3}
      onConfirmar={confirmar}
    >
      <CampoFormulario
        etiqueta="Ciclo escolar"
        error={ciclo ? null : 'No hay un ciclo escolar iniciado: los cursos pertenecen al ciclo iniciado.'}
      >
        <CampoTexto value={ciclo ? `${ciclo.id} · se imparte en la semana 8` : '—'} disabled onChange={() => {}} />
      </CampoFormulario>
      <CampoFormulario etiqueta="Nombre del curso" requerido error={nombreRepetido ? 'Ya existe un curso con ese nombre en el ciclo.' : null}>
        <CampoTexto value={form.nombre} onChange={(v) => cambiar('nombre', v)} enfocar={sidebar3Abierto ? apertura : null} />
      </CampoFormulario>
      <CampoFormulario etiqueta="Docente que lo imparte" requerido>
        <ListaExpandible
          valorActual={form.docenteId}
          etiquetaActual={docente ? nombreCompleto(docente) : 'Selecciona…'}
          opciones={docentes.map((p) => ({ id: p.id, label: nombreCompleto(p) }))}
          onSeleccionar={(id) => cambiar('docenteId', id)}
        />
      </CampoFormulario>
      <CampoFormulario etiqueta="Materia que recupera">
        <ListaExpandible
          valorActual={form.materia}
          etiquetaActual={materia ? etiquetaMateria(materia) : 'Ninguna (curso voluntario)'}
          opciones={[{ id: SIN_MATERIA, label: 'Ninguna (curso voluntario)' }, ...materias.map((m) => ({ id: m.id, label: etiquetaMateria(m) }))]}
          onSeleccionar={(id) => cambiar('materia', id)}
        />
      </CampoFormulario>
      <CampoFormulario etiqueta="Hora de inicio (dura 3 horas)" requerido error={horaValida ? null : 'Elige una hora de inicio hasta las 21:00.'}>
        <CampoTexto tipo="time" value={form.horaInicio} onChange={(v) => cambiar('horaInicio', v)} />
      </CampoFormulario>
    </MarcoFormulario>
  );
}
