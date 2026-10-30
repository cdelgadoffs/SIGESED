import { useEffect, useRef, useState } from 'react';
import BotonS from '../base/BotonS.jsx';
import IndicadorSync from '../base/IndicadorSync.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { filtrarEstudiantes, nombreCompleto, nombreDeCatalogo, registroActivo, segunEstado } from '../../utils/registros.js';
import { evaluacionDe } from '../../utils/evaluaciones.js';
import { ALTO_HOJA, ANCHO_HOJA, documentoBoleta } from '../../utils/boleta.js';
import logoIcom from '../../assets/Icom.jpg';
import logo55 from '../../assets/55.jpg';
import '../../styles/widgets/VistaPreviaBoleta.css';

export default function VistaPreviaBoleta() {
  const { ESTUDIANTES, GRUPOS, EVALUACIONES, MATERIAS, PLANTEL, cicloActivoId } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, filtroEstado } = useUI();
  const iframeRef = useRef(null);
  const marcoRef = useRef(null);
  const [escala, setEscala] = useState(0);
  const alumno = registroActivo(segunEstado(filtrarEstudiantes(ESTUDIANTES, GRUPOS, terminoBusqueda), filtroEstado), registroSeleccionadoId);
  const evaluacion = alumno && cicloActivoId ? evaluacionDe(EVALUACIONES, alumno.id, cicloActivoId) : null;

  useEffect(() => {
    const marco = marcoRef.current;
    if (!marco) return undefined;
    const observador = new ResizeObserver(() => setEscala(Math.min(1, marco.clientWidth / ANCHO_HOJA, marco.clientHeight / ALTO_HOJA)));
    observador.observe(marco);
    return () => observador.disconnect();
  }, [evaluacion]);

  if (!evaluacion) {
    const mensaje = alumno && cicloActivoId
      ? `Aún no hay calificaciones guardadas de ${nombreCompleto(alumno)} en el ciclo ${cicloActivoId}. Captúralas y guarda para ver su boleta.`
      : 'Elige un estudiante de la lista para ver su boleta.';
    return <p className="widget-vista-previa-boleta-mensaje">{mensaje}</p>;
  }

  const documento = documentoBoleta({
    plantel: PLANTEL?.nombre ?? '',
    ciclo: cicloActivoId,
    alumno: nombreCompleto(alumno),
    genero: alumno.genero,
    filas: evaluacion.calificaciones.map((c) => ({ materia: nombreDeCatalogo(MATERIAS, c.materia), calificacion: c.calificacion })),
    promedio: evaluacion.promedio,
    observaciones: evaluacion.observaciones,
    logoIzquierdo: new URL(logoIcom, window.location.href).href,
    logoDerecho: new URL(logo55, window.location.href).href,
    hoja: true,
  });

  return (
    <div className="widget-vista-previa-boleta">
      <div className="widget-vista-previa-boleta-acciones">
        <IndicadorSync estado={evaluacion.sincronizacion} />
        <BotonS variant="claro" onClick={() => iframeRef.current?.contentWindow?.print()}>Imprimir / PDF</BotonS>
      </div>
      <div ref={marcoRef} className="widget-vista-previa-boleta-marco">
        <div className="widget-vista-previa-boleta-hoja" style={{ width: ANCHO_HOJA * escala, height: ALTO_HOJA * escala }}>
          <iframe
            ref={iframeRef}
            className="widget-vista-previa-boleta-documento"
            title="Boleta de calificaciones"
            srcDoc={documento}
            scrolling="no"
            style={{ width: ANCHO_HOJA, height: ALTO_HOJA, transform: `scale(${escala})` }}
          />
        </div>
      </div>
    </div>
  );
}
