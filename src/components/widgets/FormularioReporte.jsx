import { useEffect, useState } from 'react';
import CampoFormulario from '../base/CampoFormulario.jsx';
import CampoTexto from '../base/CampoTexto.jsx';
import ListaExpandible from '../base/ListaExpandible.jsx';
import Textarea from '../base/Textarea.jsx';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import MarcoFormulario from './MarcoFormulario.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { filtrarEstudiantes, nombreCompleto, nombreDeCatalogo, opcionesDeCatalogo, registroActivo, segunEstado } from '../../utils/registros.js';
import { hoyLocal } from '../../utils/fechas.js';
import '../../styles/widgets/FormularioReporte.css';

function vacio() {
  return { fecha: hoyLocal(), tipo: '', descripcion: '', acciones: '' };
}

function igual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function Reporte({ alumno }) {
  const { TIPOS_REPORTE, crearReporte, guardarBorrador, obtenerBorrador, eliminarBorrador } = useRegistros();
  const clave = `formularioReporte:${alumno.id}`;
  const [inicial] = useState(vacio);
  const [form, setForm] = useState(inicial);
  const [restaurado, setRestaurado] = useState(false);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [altas, setAltas] = useState(0);
  const [focos, setFocos] = useState(1);

  function enfocarDescripcion() {
    setFocos((n) => n + 1);
  }

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
      (igual(form, inicial) ? eliminarBorrador(clave) : guardarBorrador(clave, form)).catch(() => {});
    }, 400);
    return () => clearTimeout(temporizador);
  }, [form, restaurado, inicial, clave, guardarBorrador, eliminarBorrador]);

  function cambiar(cambios) {
    setForm((f) => ({ ...f, ...cambios }));
    setError(null);
  }

  function limpiar() {
    setForm(vacio());
    setError(null);
    eliminarBorrador(clave).catch(() => {});
  }

  const fechaFutura = form.fecha && form.fecha > hoyLocal();
  const puedeConfirmar = restaurado && form.fecha && !fechaFutura && form.tipo && form.descripcion.trim() && !ocupado;

  async function confirmar() {
    setOcupado(true);
    setError(null);
    try {
      await crearReporte({ estudianteId: alumno.id, ...form });
      limpiar();
      setAltas((n) => n + 1);
      enfocarDescripcion();
    } catch (e) {
      setError(e?.mensaje ?? 'No se pudo levantar el reporte.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <MarcoFormulario
      error={error}
      textoConfirmar="Levantar reporte"
      puedeConfirmar={puedeConfirmar}
      onCancelar={limpiar}
      onConfirmar={confirmar}
    >
      <CampoFormulario etiqueta="Estudiante">
        <div className="widget-formulario-reporte-estudiante">
          <span className="widget-formulario-reporte-nombre">{nombreCompleto(alumno)}</span>
          <BadgeDinamico texto={alumno.matricula} icono="ri-id-card-line" tono="gris" title="Matrícula" />
        </div>
      </CampoFormulario>
      <CampoFormulario etiqueta="Fecha" requerido medio error={fechaFutura ? 'No puede ser posterior a hoy.' : null}>
        <CampoTexto tipo="date" value={form.fecha} onChange={(v) => { cambiar({ fecha: v }); enfocarDescripcion(); }} />
      </CampoFormulario>
      <CampoFormulario etiqueta="Tipo de reporte" requerido medio>
        <ListaExpandible
          valorActual={form.tipo}
          etiquetaActual={nombreDeCatalogo(TIPOS_REPORTE, form.tipo) || 'Selecciona…'}
          opciones={opcionesDeCatalogo(TIPOS_REPORTE)}
          onSeleccionar={(id) => { cambiar({ tipo: id }); enfocarDescripcion(); }}
        />
      </CampoFormulario>
      <CampoFormulario etiqueta="Descripción" requerido>
        <div className="widget-formulario-reporte-texto" key={`d${altas}`}>
          <Textarea value={form.descripcion} onChange={(v) => cambiar({ descripcion: v })} placeholder="¿Qué sucedió?" enfocar={focos} />
        </div>
      </CampoFormulario>
      <CampoFormulario etiqueta="Acciones tomadas">
        <div className="widget-formulario-reporte-texto" key={`a${altas}`}>
          <Textarea value={form.acciones} onChange={(v) => cambiar({ acciones: v })} placeholder="Ej. llamada a padres, citatorio…" />
        </div>
      </CampoFormulario>
    </MarcoFormulario>
  );
}

export default function FormularioReporte() {
  const { ESTUDIANTES, GRUPOS, CARGA } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, filtroEstado } = useUI();
  const alumno = registroActivo(segunEstado(filtrarEstudiantes(ESTUDIANTES, GRUPOS, terminoBusqueda), filtroEstado), registroSeleccionadoId);

  if (!alumno) {
    return (
      <div className="widget-formulario-reporte-mensaje">
        <i className="ri-user-search-line" aria-hidden="true"></i>
        <p>{CARGA.estudiantes.cargando ? 'Cargando…' : 'Elige un estudiante de la lista para levantar un reporte.'}</p>
      </div>
    );
  }
  return <Reporte key={alumno.id} alumno={alumno} />;
}
