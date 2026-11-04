import { useRef, useState } from 'react';
import Card from '../base/Card.jsx';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import BotonS from '../base/BotonS.jsx';
import BotonIcono from '../base/BotonIcono.jsx';
import Checkbox from '../base/Checkbox.jsx';
import ListaExpandible from '../base/ListaExpandible.jsx';
import OpcionesRegistro from './OpcionesRegistro.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { nombreCompleto, ordenarPorTexto, registroActivo } from '../../utils/registros.js';
import { coincideBusqueda } from '../../utils/texto.js';
import { inscritosDe } from '../../utils/cursos.js';
import { ROLES_FIRMA, cuerpoAlumno, cuerpoDocente, documentoConstancias, textoPeriodo } from '../../utils/constancias.js';
import { imprimirDocumento } from '../../utils/impresion.js';
import logoIcom from '../../assets/Icom.jpg';
import logo55 from '../../assets/55.jpg';
import '../../styles/widgets/FichaCurso.css';

const AGREGAR = '__agregar';

export default function FichaCurso() {
  const {
    CURSOS, CICLOS, PERSONAL, ESTUDIANTES, GRUPOS, MATERIAS, PLANTEL, CARGA,
    eliminarCurso, inscribirEnCurso, quitarDeCurso, marcarAcreditado,
  } = useRegistros();
  const { terminoBusqueda, registroSeleccionadoId, abrirEdicionRegistro, setRegistroSeleccionadoId } = useUI();
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [documento, setDocumento] = useState('');
  const [impresiones, setImpresiones] = useState(0);
  const iframeRef = useRef(null);
  const curso = registroActivo(CURSOS.filter((c) => coincideBusqueda(terminoBusqueda, [c.nombre, c.cicloId])), registroSeleccionadoId);

  if (!curso) {
    let mensaje = 'Crea un curso con el botón «+» de la lista.';
    if (CURSOS.length > 0) mensaje = 'Elige un curso de la lista.';
    else if (CARGA.cursos?.cargando) mensaje = 'Cargando…';
    return <p className="widget-ficha-curso-mensaje">{mensaje}</p>;
  }

  const ciclo = CICLOS.find((c) => c.id === curso.cicloId);
  const modificable = !!ciclo && !ciclo.cerrado;
  const docente = PERSONAL.find((p) => p.id === curso.docenteId);
  const materia = MATERIAS.find((m) => m.id === curso.materia);
  const horario = `${curso.horaInicio} a ${curso.horaFin} horas`;
  const periodo = textoPeriodo(curso.semana);
  const inscritos = inscritosDe(curso)
    .map((i) => ({ ...i, alumno: ESTUDIANTES.find((e) => e.id === i.id) }))
    .filter((i) => i.alumno);
  const ordenados = [...inscritos].sort((a, b) => (a.tipo === b.tipo ? nombreCompleto(a.alumno).localeCompare(nombreCompleto(b.alumno), 'es') : a.tipo === 'obligatorio' ? -1 : 1));
  const ids = new Set(inscritos.map((i) => i.id));
  const disponibles = ordenarPorTexto(ESTUDIANTES.filter((e) => e.activo !== false && !ids.has(e.id)), nombreCompleto);
  const acreditados = ordenados.filter((i) => curso.acreditados.includes(i.id));

  async function ejecutar(operacion) {
    setOcupado(true);
    setError(null);
    try {
      await operacion();
    } catch (e) {
      setError(e?.mensaje ?? 'No se pudo completar la operación.');
    } finally {
      setOcupado(false);
    }
  }

  function firmas() {
    return ROLES_FIRMA.map((r) => {
      const persona = ordenarPorTexto(PERSONAL.filter((p) => p.activo !== false && (p.roles ?? []).includes(r.id)), nombreCompleto)[0];
      return { etiqueta: r.etiqueta, nombre: persona ? nombreCompleto(persona) : '' };
    });
  }

  function imprimir(titulo, constancias) {
    setImpresiones((n) => n + 1);
    setDocumento(documentoConstancias({
      titulo,
      constancias,
      cicloId: curso.cicloId,
      institucion: PLANTEL?.institucion ?? '',
      plantel: PLANTEL?.nombre ?? '',
      municipio: PLANTEL?.municipio ?? '',
      fecha: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
      firmas: firmas(),
      logoIzquierdo: new URL(logoIcom, window.location.href).href,
      logoDerecho: new URL(logo55, window.location.href).href,
    }));
  }

  const comunes = { curso: curso.nombre, materia: materia?.nombre, periodo, horario };
  const constanciaAlumno = (a) => ({
    nombre: nombreCompleto(a),
    matricula: a.matricula,
    cuerpo: cuerpoAlumno({ ...comunes, docente: docente ? nombreCompleto(docente) : '' }),
  });
  const archivo = (texto) => `Constancia_${texto}_${curso.cicloId}`.replace(/\s+/g, '_');

  return (
    <div className="widget-ficha-curso">
      <Card>
        <div className="widget-ficha-curso-encabezado">
          <span className="widget-ficha-curso-nombre">{curso.nombre}</span>
          <BadgeDinamico texto={materia ? 'Recuperación' : 'Voluntario'} icono={materia ? 'ri-refresh-line' : 'ri-hand-heart-line'} tono={materia ? 'naranja' : 'azul'} />
          <BadgeDinamico texto={`Ciclo ${curso.cicloId}`} tono="gris" />
        </div>
        <dl className="widget-ficha-curso-datos">
          <dt>Docente</dt>
          <dd>{docente ? nombreCompleto(docente) : 'Sin docente'}</dd>
          <dt>Materia que recupera</dt>
          <dd>{materia ? `${materia.clave} · ${materia.nombre}` : 'Ninguna (inscripción voluntaria)'}</dd>
          <dt>Fecha</dt>
          <dd>{`Semana 8, ${periodo}`}</dd>
          <dt>Horario</dt>
          <dd>{`${horario} (3 horas)`}</dd>
        </dl>
        <div className="widget-ficha-curso-acciones">
          <BotonS
            variant="claro"
            disabled={!docente}
            onClick={() => imprimir(archivo(`${docente.nombre.split(' ')[0]}_${docente.primerApellido}`), [{
              nombre: nombreCompleto(docente),
              cuerpo: cuerpoDocente({ ...comunes, alumnos: inscritos.length }),
            }])}
          >
            <i className="ri-file-pdf-2-line" /> Constancia del docente
          </BotonS>
          <BotonS
            variant="claro"
            disabled={acreditados.length === 0}
            onClick={() => imprimir(archivo(curso.nombre), acreditados.map((i) => constanciaAlumno(i.alumno)))}
          >
            <i className="ri-file-pdf-2-line" /> Constancias de acreditados
          </BotonS>
          {modificable && (
            <OpcionesRegistro
              descripcion={`el curso «${curso.nombre}»`}
              onEditar={() => abrirEdicionRegistro(curso.id)}
              onEliminar={async () => { await eliminarCurso(curso.id); setRegistroSeleccionadoId(null); }}
            />
          )}
        </div>
      </Card>

      <section className="widget-ficha-curso-alumnos">
        <div className="widget-ficha-curso-alumnos-encabezado">
          <h3>{`Alumnos inscritos (${inscritos.length})`}</h3>
          <span className="widget-ficha-curso-conteo">{`${acreditados.length} acreditados`}</span>
          {modificable && (
            <div className="widget-ficha-curso-agregar">
              <ListaExpandible
                valorActual={AGREGAR}
                etiquetaActual="+ Agregar alumno voluntario"
                opciones={disponibles.map((e) => ({ id: e.id, label: `${nombreCompleto(e)} · ${e.matricula}` }))}
                onSeleccionar={(id) => ejecutar(() => inscribirEnCurso(curso.id, id))}
              />
            </div>
          )}
        </div>
        {error && <p className="widget-ficha-curso-error">{error}</p>}
        {ordenados.length === 0 ? (
          <p className="widget-ficha-curso-mensaje">
            {materia ? 'Ningún alumno activo tiene esta materia reprobada o con NP. Agrega voluntarios.' : 'Agrega alumnos voluntarios.'}
          </p>
        ) : ordenados.map(({ id, tipo, alumno }) => {
          const acreditado = curso.acreditados.includes(id);
          const grupo = GRUPOS.find((g) => g.id === alumno.grupo);
          return (
            <div key={id} className={'widget-ficha-curso-alumno' + (acreditado ? ' widget-ficha-curso-alumno-acreditado' : '')}>
              <div className="widget-ficha-curso-alumno-datos">
                <span className="widget-ficha-curso-alumno-nombre">{nombreCompleto(alumno)}</span>
                <span className="widget-ficha-curso-alumno-detalle">{[alumno.matricula, grupo?.nombre].filter(Boolean).join(' · ')}</span>
              </div>
              <BadgeDinamico texto={tipo === 'obligatorio' ? 'Obligatorio' : 'Voluntario'} tono={tipo === 'obligatorio' ? 'rojo' : 'azul'} />
              <Checkbox
                label="Acreditó"
                checked={acreditado}
                disabled={!modificable || ocupado}
                onChange={(v) => ejecutar(() => marcarAcreditado(curso.id, id, v))}
              />
              <BotonIcono
                icono="ri-file-pdf-2-line"
                ariaLabel="Constancia"
                disabled={!acreditado}
                onClick={() => imprimir(archivo(`${alumno.nombre.split(' ')[0]}_${alumno.primerApellido}`), [constanciaAlumno(alumno)])}
              />
              {tipo === 'voluntario' && modificable ? (
                <BotonIcono icono="ri-close-line" ariaLabel="Quitar del curso" disabled={ocupado} onClick={() => ejecutar(() => quitarDeCurso(curso.id, id))} />
              ) : <span className="widget-ficha-curso-hueco" />}
            </div>
          );
        })}
      </section>
      {documento && (
        <iframe
          key={impresiones}
          ref={iframeRef}
          className="widget-ficha-curso-impresion"
          title="Constancia para imprimir"
          srcDoc={documento}
          onLoad={() => imprimirDocumento(iframeRef.current?.contentWindow)}
        />
      )}
    </div>
  );
}
