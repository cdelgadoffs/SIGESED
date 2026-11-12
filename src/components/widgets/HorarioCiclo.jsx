import { useRef, useState } from 'react';
import Card from '../base/Card.jsx';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import BotonS from '../base/BotonS.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { horasDeModalidad, inscripcionDe, personalizadasDe, tipoHorario } from '../../utils/inscripciones.js';
import { COLORES_DIA, DIAS_POR_TIPO, bloquesDe, documentoHorarios, tieneDisenoHorario, tinte } from '../../utils/horarioEscolar.js';
import { DIAS_SEMANA } from '../../utils/fechas.js';
import { imprimirDocumento } from '../../utils/impresion.js';
import { nombreCompleto, nombreDeCatalogo } from '../../utils/registros.js';
import logoIcom from '../../assets/Icom.png';
import logo55 from '../../assets/55.jpg';
import comfortaaRegular from '@fontsource/comfortaa/files/comfortaa-latin-400-normal.woff2';
import comfortaaNegrita from '@fontsource/comfortaa/files/comfortaa-latin-700-normal.woff2';
import '@fontsource/comfortaa/700.css';
import '../../styles/widgets/HorarioCiclo.css';

const FUENTES_COMFORTAA = ['400 11pt Comfortaa', '700 11pt Comfortaa'];

const sinCero = (hora) => hora.replace(/^0/, '');

function Rejilla({ hoja }) {
  const dias = DIAS_POR_TIPO[hoja.tipo];
  const filaDe = new Map();
  const filas = ['34px'];
  hoja.horas.forEach((h) => {
    filaDe.set(h.id, filas.length + 1);
    filas.push(h.descanso ? '30px' : 'minmax(56px, auto)');
  });
  const clase = hoja.horas.filter((h) => !h.descanso);
  const filaClase = (i) => filaDe.get(clase[i].id);
  const estilo = {
    gridTemplateColumns: `104px repeat(${dias.length}, minmax(0, 1fr))`,
    gridTemplateRows: filas.join(' '),
    maxWidth: dias.length === 1 ? 480 : undefined,
  };
  return (
    <div className="widget-horario-ciclo-rejilla" style={estilo}>
      <div className="widget-horario-ciclo-cabecera widget-horario-ciclo-cabecera-hora" style={{ gridRow: 1, gridColumn: 1 }}>Hora</div>
      {dias.map((d, i) => (
        <div key={d} className="widget-horario-ciclo-cabecera" style={{ gridRow: 1, gridColumn: i + 2, background: COLORES_DIA[d].fondo }}>
          {DIAS_SEMANA[d]}
        </div>
      ))}
      {hoja.horas.map((h) => {
        const fila = filaDe.get(h.id);
        const rango = `${sinCero(h.inicio)} – ${sinCero(h.fin)}`;
        if (h.descanso) {
          return [
            <div key={`${h.id}-h`} className="widget-horario-ciclo-receso-hora" style={{ gridRow: fila, gridColumn: 1 }}><strong>DESCANSO</strong>{rango}</div>,
            <div key={`${h.id}-r`} className="widget-horario-ciclo-receso" style={{ gridRow: fila, gridColumn: `2 / ${dias.length + 2}` }} />,
          ];
        }
        return [
          <div key={`${h.id}-h`} className="widget-horario-ciclo-hora" style={{ gridRow: fila, gridColumn: 1 }}>
            <span className="widget-horario-ciclo-hora-numero">{`${h.numero}ª HORA`}</span>
            <span className="widget-horario-ciclo-hora-rango">{rango}</span>
          </div>,
          ...dias.map((d, i) => <div key={`${h.id}-${d}`} className="widget-horario-ciclo-vacia" style={{ gridRow: fila, gridColumn: i + 2 }} />),
        ];
      })}
      {bloquesDe(hoja.asignaciones, hoja.horas).map((b) => {
        const i = dias.indexOf(b.dia);
        if (i < 0) return null;
        const color = COLORES_DIA[b.dia];
        const a = b.asignacion;
        return (
          <div
            key={`${a.clave}-${b.dia}-${b.desde}`}
            className="widget-horario-ciclo-bloque"
            style={{ gridRow: `${filaClase(b.desde)} / ${filaClase(b.hasta) + 1}`, gridColumn: i + 2, background: tinte(color.fondo, 0.35), borderLeftColor: color.acento }}
          >
            {b.continua ? (
              <span className="widget-horario-ciclo-bloque-continua">{`${a.clave} · (continúa)`}</span>
            ) : (
              <>
                <span className="widget-horario-ciclo-bloque-materia">{a.materia}</span>
                <span className="widget-horario-ciclo-bloque-detalle"><strong>{a.clave}</strong>{a.docente ? ` · ${a.docente}` : ''}</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function HorarioCiclo() {
  const { CICLOS, cicloActivoId, GRUPOS, MODALIDADES, MATERIAS, HORAS_CLASE, PERSONAL, ESTUDIANTES, INSCRIPCIONES, PLANTEL, CARGA } = useRegistros();
  const { setVistaActual } = useUI();
  const { puede } = useAuth();
  const iframeRef = useRef(null);
  const [documento, setDocumento] = useState(null);
  const [impresiones, setImpresiones] = useState(0);
  const [abiertos, setAbiertos] = useState(() => new Set());
  const ciclo = CICLOS.find((c) => c.id === cicloActivoId);

  if (!ciclo) {
    return <p className="widget-horario-ciclo-mensaje">{CARGA.ciclos.cargando ? 'Cargando…' : 'Aún no hay ciclos escolares.'}</p>;
  }

  const normales = GRUPOS
    .map((g) => ({ id: g.id, grupo: g, materias: inscripcionDe(INSCRIPCIONES, ciclo.id, g.id)?.materias ?? [] }))
    .filter(({ grupo, materias }) => materias.length > 0 || (!ciclo.iniciado && grupo.activo !== false));
  const personalizados = GRUPOS.flatMap((g) => personalizadasDe(INSCRIPCIONES, ciclo.id, g.id).map((p) => {
    const nombres = (p.estudiantes ?? []).map((id) => ESTUDIANTES.find((e) => e.id === id)).filter(Boolean).map(nombreCompleto);
    return { id: p.id, grupo: g, materias: p.materias, alumnos: Math.max(nombres.length, 1), nombres };
  }));
  const grupos = [...normales, ...personalizados];
  const textoAlumnos = (nombres) => (nombres.length <= 2 ? nombres.join(' y ') : `${nombres[0]} y ${nombres.length - 1} más`);
  const alternar = (id) => setAbiertos((a) => {
    const nuevo = new Set(a);
    if (nuevo.has(id)) nuevo.delete(id);
    else nuevo.add(id);
    return nuevo;
  });
  const nombreDe = (e) => (e.alumnos ? `${e.grupo.nombre} · Personalizado` : e.grupo.nombre);
  const imprimibles = grupos.filter(({ grupo, materias }) => materias.length > 0 && tieneDisenoHorario(tipoHorario(grupo, MODALIDADES)));

  function hojaDe({ grupo, materias, alumnos, nombres }) {
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
      grupo: nombreDe({ grupo, alumnos }),
      modalidad: nombreDeCatalogo(MODALIDADES, grupo.modalidad),
      tipo: tipoHorario(grupo, MODALIDADES),
      horas: horasDeModalidad(HORAS_CLASE, grupo),
      asignaciones,
      anotaciones: nombres ? [`Horario personalizado. Inscritos: ${nombres.join(', ')}.`] : [],
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
    Promise.all(FUENTES_COMFORTAA.map((f) => ventana.document.fonts.load(f))).catch(() => null).then(() => imprimirDocumento(ventana));
  }

  return (
    <div className="widget-horario-ciclo">
      <div className="widget-horario-ciclo-encabezado">
        <span className="widget-horario-ciclo-titulo">Horarios del ciclo escolar {ciclo.id}</span>
        {ciclo.iniciado
          ? <BadgeDinamico texto="Iniciado" icono="ri-play-circle-line" tono="verde" />
          : <BadgeDinamico texto="En preparación" icono="ri-time-line" tono="naranja" />}
        {puede('inicio') && !ciclo.iniciado && !ciclo.cerrado && <BotonS variant="claro" onClick={() => setVistaActual('inicio')}>Configurar en Inicio</BotonS>}
        {imprimibles.filter((e) => !e.nombres).length > 1 && (
          <BotonS variant="claro" onClick={() => imprimir(imprimibles.filter((e) => !e.nombres), `Control de horarios_${ciclo.id}`)}>Imprimir todos</BotonS>
        )}
      </div>
      {grupos.length === 0 && <p className="widget-horario-ciclo-mensaje">Ningún grupo está inscrito en este ciclo.</p>}
      {grupos.map((entrada) => {
        const { grupo, materias } = entrada;
        const tipo = tipoHorario(grupo, MODALIDADES);
        const colapsado = !!entrada.nombres && !abiertos.has(entrada.id);
        return (
          <Card key={entrada.id}>
            <div
              className={`widget-horario-ciclo-grupo${entrada.nombres ? ' widget-horario-ciclo-grupo-plegable' : ''}`}
              onClick={entrada.nombres ? () => alternar(entrada.id) : undefined}
            >
              {entrada.nombres && <i className={colapsado ? 'ri-arrow-right-s-line' : 'ri-arrow-down-s-line'} />}
              <span className="widget-horario-ciclo-grupo-nombre">{nombreDe(entrada)}</span>
              {entrada.nombres && <BadgeDinamico texto={textoAlumnos(entrada.nombres) || 'Sin alumnos'} icono="ri-user-settings-line" tono="azul" />}
              <BadgeDinamico texto={nombreDeCatalogo(MODALIDADES, grupo.modalidad)} tono="gris" />
              {imprimibles.includes(entrada) && (
                <BotonS variant="claro" onClick={(e) => { e?.stopPropagation?.(); imprimir([entrada], `${nombreDe(entrada).replace(' · ', '_')}_${ciclo.id}`); }}>Imprimir / PDF</BotonS>
              )}
            </div>
            {colapsado ? null : materias.length === 0 ? (
              <p className="widget-horario-ciclo-vacio">Sin materias inscritas.</p>
            ) : tieneDisenoHorario(tipo) ? (
              <div className="widget-horario-ciclo-cuerpo">
                <Rejilla hoja={hojaDe(entrada)} />
              </div>
            ) : (
              <div className="widget-horario-ciclo-online">
                {hojaDe(entrada).asignaciones.map((a) => (
                  <div key={a.clave} className="widget-horario-ciclo-bloque widget-horario-ciclo-bloque-online">
                    <span className="widget-horario-ciclo-bloque-materia">{a.materia}</span>
                    <span className="widget-horario-ciclo-bloque-detalle"><strong>{a.clave}</strong>{a.docente ? ` · ${a.docente}` : ''}</span>
                  </div>
                ))}
              </div>
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
