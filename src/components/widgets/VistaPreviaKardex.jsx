import { useEffect, useRef, useState } from 'react';
import BotonS from '../base/BotonS.jsx';
import Checkbox from '../base/Checkbox.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { filtrarEstudiantes, nombreCompleto, nombreDeCatalogo, registroActivo, segunEstado } from '../../utils/registros.js';
import { ALTO_HOJA_KARDEX, ANCHO_HOJA_KARDEX, documentoKardex } from '../../utils/kardex.js';
import { imprimirDocumento } from '../../utils/impresion.js';
import { useScrollbarPersonalizada } from '../../hooks/useScrollbarPersonalizada.js';
import logoIcom from '../../assets/Icom.jpg';
import logo55 from '../../assets/55.jpg';
import '../../styles/widgets/VistaPreviaKardex.css';

const MARGEN_INFERIOR = 46;

export default function VistaPreviaKardex() {
  const { ESTUDIANTES, GRUPOS, KARDEX, MATERIAS, PROGRAMAS_EDUCATIVOS, MODALIDADES, TIEMPOS, PLANTEL } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, filtroEstado } = useUI();
  const iframeRef = useRef(null);
  const { contenedorRef: marcoRef, thumb, onScroll, onArrastrarThumb } = useScrollbarPersonalizada();
  const [escala, setEscala] = useState(0);
  const [altoDocumento, setAltoDocumento] = useState(ALTO_HOJA_KARDEX);
  const [incluirFirma, setIncluirFirma] = useState(true);
  const alumno = registroActivo(segunEstado(filtrarEstudiantes(ESTUDIANTES, GRUPOS, terminoBusqueda), filtroEstado), registroSeleccionadoId);
  const kardex = alumno ? KARDEX.find((k) => k.estudianteId === alumno.id) : null;

  useEffect(() => {
    const marco = marcoRef.current;
    if (!marco) return undefined;
    const observador = new ResizeObserver(() => setEscala(Math.min(1, marco.clientWidth / ANCHO_HOJA_KARDEX, marco.clientHeight / ALTO_HOJA_KARDEX)));
    observador.observe(marco);
    return () => observador.disconnect();
  }, [kardex]);

  if (!kardex) {
    const mensaje = alumno
      ? `${nombreCompleto(alumno)} aún no tiene calificaciones en su kárdex. Usa el «+» del estudiante en la lista para capturarlas.`
      : 'Elige un estudiante de la lista para ver su kárdex.';
    return <p className="widget-vista-previa-kardex-mensaje">{mensaje}</p>;
  }

  const grupo = GRUPOS.find((g) => g.id === alumno.grupo);
  const nombreMateria = new Map(MATERIAS.map((m) => [m.id, m.nombre]));
  const documento = documentoKardex({
    institucion: PLANTEL?.institucion ?? '',
    plantel: PLANTEL?.nombre ?? '',
    alumno: nombreCompleto(alumno),
    matricula: alumno.matricula,
    programa: nombreDeCatalogo(PROGRAMAS_EDUCATIVOS, grupo?.programaEducativo),
    grupo: grupo?.nombre,
    tiempo: nombreDeCatalogo(TIEMPOS, alumno.tiempo),
    modalidad: nombreDeCatalogo(MODALIDADES, grupo?.modalidad),
    cuatrimestres: kardex.cuatrimestres.map((c) => ({
      ...c,
      materias: c.materias.map((m) => ({ ...m, nombre: nombreMateria.get(m.materia) ?? m.materia })),
    })),
    promedioGeneral: kardex.promedioGeneral,
    totalMaterias: kardex.totalMaterias,
    incluirFirma,
    fecha: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
    logoIzquierdo: new URL(logoIcom, window.location.href).href,
    logoDerecho: new URL(logo55, window.location.href).href,
  });

  function medirDocumento() {
    const doc = iframeRef.current?.contentDocument;
    const contenido = doc?.getElementById('kardex');
    if (!contenido) return;
    setAltoDocumento(Math.max(ALTO_HOJA_KARDEX, Math.ceil(contenido.getBoundingClientRect().bottom + MARGEN_INFERIOR)));
  }

  return (
    <div className="widget-vista-previa-kardex">
      <div className="widget-vista-previa-kardex-acciones">
        <Checkbox checked={incluirFirma} onChange={setIncluirFirma} label="Incluir firma de conformidad" />
        <BotonS variant="claro" onClick={() => imprimirDocumento(iframeRef.current?.contentWindow)}>Imprimir / PDF</BotonS>
      </div>
      <div className="widget-vista-previa-kardex-zona">
        <div ref={marcoRef} className="widget-vista-previa-kardex-marco" onScroll={onScroll}>
          <div className="widget-vista-previa-kardex-hoja" style={{ width: ANCHO_HOJA_KARDEX * escala, height: altoDocumento * escala }}>
            <iframe
              ref={iframeRef}
              className="widget-vista-previa-kardex-documento"
              title="Kárdex académico"
              srcDoc={documento}
              scrolling="no"
              onLoad={medirDocumento}
              style={{ width: ANCHO_HOJA_KARDEX, height: altoDocumento, transform: `scale(${escala})` }}
            />
          </div>
        </div>
        {thumb.visible && (
          <div
            className="widget-vista-previa-kardex-thumb"
            style={{ height: thumb.alto, top: thumb.top }}
            onMouseDown={onArrastrarThumb}
          />
        )}
      </div>
    </div>
  );
}
