import { useRef, useState } from 'react';
import Card from '../base/Card.jsx';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import BotonS from '../base/BotonS.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { horasDeModalidad, inscripcionDe, textoHorario, tipoHorario } from '../../utils/inscripciones.js';
import { documentoHorarios, tieneDisenoHorario } from '../../utils/horarioEscolar.js';
import { nombreCompleto, nombreDeCatalogo } from '../../utils/registros.js';
import logoIcom from '../../assets/Icom.jpg';
import logo55 from '../../assets/55.jpg';
import comfortaaRegular from '@fontsource/comfortaa/files/comfortaa-latin-400-normal.woff2';
import comfortaaNegrita from '@fontsource/comfortaa/files/comfortaa-latin-700-normal.woff2';
import '../../styles/widgets/HorarioCiclo.css';

const FUENTES_COMFORTAA = ['400 11pt Comfortaa', '700 11pt Comfortaa'];

export default function HorarioCiclo() {
  const { CICLOS, cicloActivoId, GRUPOS, MODALIDADES, MATERIAS, HORAS_CLASE, PERSONAL, INSCRIPCIONES, PLANTEL, CARGA } = useRegistros();
  const { setVistaActual } = useUI();
  const iframeRef = useRef(null);
  const [documento, setDocumento] = useState(null);
  const [impresiones, setImpresiones] = useState(0);
  const ciclo = CICLOS.find((c) => c.id === cicloActivoId);

  if (!ciclo) {
    return <p className="widget-horario-ciclo-mensaje">{CARGA.ciclos.cargando ? 'Cargando…' : 'Aún no hay ciclos escolares.'}</p>;
  }

  const grupos = GRUPOS
    .map((g) => ({ grupo: g, materias: inscripcionDe(INSCRIPCIONES, ciclo.id, g.id)?.materias ?? [] }))
    .filter(({ grupo, materias }) => materias.length > 0 || (!ciclo.iniciado && grupo.activo !== false));
  const imprimibles = grupos.filter(({ grupo, materias }) => materias.length > 0 && tieneDisenoHorario(tipoHorario(grupo, MODALIDADES)));

  function hojaDe({ grupo, materias }) {
    const asignaciones = materias.map((m) => {
      const materia = MATERIAS.find((x) => x.id === m.materia);
      const docente = PERSONAL.find((p) => p.id === m.docenteId);
      return {
        clave: materia?.clave ?? m.materia,
        materia: materia?.nombre ?? m.materia,
        docente: docente ? [docente.nombre.split(' ')[0], docente.primerApellido].filter(Boolean).join(' ') : '',
        docenteCompleto: docente ? nombreCompleto(docente) : '',
        bloques: m.horario,
      };
    });
    return {
      grupo: grupo.nombre,
      modalidad: nombreDeCatalogo(MODALIDADES, grupo.modalidad),
      tipo: tipoHorario(grupo, MODALIDADES),
      horas: horasDeModalidad(HORAS_CLASE, grupo),
      asignaciones,
    };
  }

  function imprimir(lista, titulo) {
    setImpresiones((n) => n + 1);
    setDocumento(documentoHorarios({
      titulo,
      institucion: PLANTEL?.institucion ?? '',
      plantel: PLANTEL?.nombre ?? '',
      municipio: PLANTEL?.municipio ?? '',
      ciclo: ciclo.id,
      fecha: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }),
      logoIzquierdo: new URL(logoIcom, window.location.href).href,
      logoDerecho: new URL(logo55, window.location.href).href,
      fuentes: {
        regular: new URL(comfortaaRegular, window.location.href).href,
        negrita: new URL(comfortaaNegrita, window.location.href).href,
      },
      hojas: lista.map(hojaDe),
    }));
  }

  function alCargar() {
    const ventana = iframeRef.current?.contentWindow;
    if (!documento || !ventana) return;
    Promise.all(FUENTES_COMFORTAA.map((f) => ventana.document.fonts.load(f))).catch(() => null).then(() => ventana.print());
  }

  return (
    <div className="widget-horario-ciclo">
      <div className="widget-horario-ciclo-encabezado">
        <span className="widget-horario-ciclo-titulo">Horarios del ciclo escolar {ciclo.id}</span>
        {ciclo.iniciado
          ? <BadgeDinamico texto="Iniciado" icono="ri-play-circle-line" tono="verde" />
          : <BadgeDinamico texto="En preparación" icono="ri-time-line" tono="naranja" />}
        {!ciclo.iniciado && !ciclo.cerrado && <BotonS variant="claro" onClick={() => setVistaActual('inicio')}>Configurar en Inicio</BotonS>}
        {imprimibles.length > 1 && (
          <BotonS variant="claro" onClick={() => imprimir(imprimibles, `Horarios_${ciclo.id}`)}>Imprimir todos</BotonS>
        )}
      </div>
      {grupos.length === 0 && <p className="widget-horario-ciclo-mensaje">Ningún grupo está inscrito en este ciclo.</p>}
      {grupos.map((entrada) => {
        const { grupo, materias } = entrada;
        const tipo = tipoHorario(grupo, MODALIDADES);
        return (
          <Card key={grupo.id}>
            <div className="widget-horario-ciclo-grupo">
              <span className="widget-horario-ciclo-grupo-nombre">{grupo.nombre}</span>
              <BadgeDinamico texto={nombreDeCatalogo(MODALIDADES, grupo.modalidad)} tono="gris" />
              {imprimibles.includes(entrada) && (
                <BotonS variant="claro" onClick={() => imprimir([entrada], `${grupo.nombre}_${ciclo.id}`)}>Imprimir / PDF</BotonS>
              )}
            </div>
            {materias.length === 0 ? (
              <p className="widget-horario-ciclo-vacio">Sin materias inscritas.</p>
            ) : (
              <table className="widget-horario-ciclo-tabla">
                <thead>
                  <tr><th>Materia</th><th>Docente</th><th>Horario</th></tr>
                </thead>
                <tbody>
                  {materias.map((m) => {
                    const materia = MATERIAS.find((x) => x.id === m.materia);
                    const docente = PERSONAL.find((p) => p.id === m.docenteId);
                    return (
                      <tr key={m.materia}>
                        <td>{materia ? `${materia.clave} · ${materia.nombre}` : m.materia}</td>
                        <td>{docente ? nombreCompleto(docente) : 'Sin docente'}</td>
                        <td>{tipo === null ? 'Online, sin horario' : (textoHorario(m.horario, HORAS_CLASE) || 'Sin horario')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>
        );
      })}
      {documento && (
        <iframe
          key={impresiones}
          ref={iframeRef}
          className="widget-horario-ciclo-impresion"
          title="Horario escolar para imprimir"
          srcDoc={documento}
          onLoad={alCargar}
        />
      )}
    </div>
  );
}
