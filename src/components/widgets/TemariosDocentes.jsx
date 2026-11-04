import { useRef, useState } from 'react';
import BotonS from '../base/BotonS.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useScrollbarPersonalizada } from '../../hooks/useScrollbarPersonalizada.js';
import { nombreCompleto, nombreDeCatalogo, ordenarPorTexto } from '../../utils/registros.js';
import { documentoPlanEstudios } from '../../utils/planEstudios.js';
import { imprimirDocumento } from '../../utils/impresion.js';
import '../../styles/widgets/TemariosDocentes.css';

const ROL_DOCENTE = 'docente';

function primeraPalabra(texto) {
  return (texto ?? '').trim().split(/\s+/)[0] ?? '';
}

function tieneTemario(m) {
  return (m?.temas ?? []).length > 0;
}

export default function TemariosDocentes() {
  const { PERSONAL, GRUPOS, MATERIAS, INSCRIPCIONES, PROGRAMAS_EDUCATIVOS, PLANTEL, cicloActivoId } = useRegistros();
  const { cuentaActiva, rolesSesion, rolActivo } = useAuth();
  const rolesVigentes = rolesSesion.filter(rolActivo);
  const soloPropios = rolesVigentes.length > 0 && rolesVigentes.every((r) => r === ROL_DOCENTE);
  const { contenedorRef, thumb, onScroll, onArrastrarThumb } = useScrollbarPersonalizada();
  const [documento, setDocumento] = useState('');
  const [impresiones, setImpresiones] = useState(0);
  const iframeRef = useRef(null);
  const materiaDe = new Map(MATERIAS.map((m) => [m.id, m]));

  const porDocente = new Map();
  INSCRIPCIONES.filter((i) => i.cicloId === cicloActivoId).forEach((i) => {
    const grupo = GRUPOS.find((g) => g.id === i.grupoId);
    if (!grupo) return;
    i.materias.filter((m) => m.docenteId).forEach((m) => {
      if (!porDocente.has(m.docenteId)) porDocente.set(m.docenteId, new Map());
      const grupos = porDocente.get(m.docenteId);
      if (!grupos.has(grupo.id)) grupos.set(grupo.id, { grupo, materias: [] });
      const materia = materiaDe.get(m.materia);
      if (materia) grupos.get(grupo.id).materias.push(materia);
    });
  });
  const docentes = ordenarPorTexto(PERSONAL.filter((p) => porDocente.has(p.id) && (!soloPropios || p.id === cuentaActiva?.usuario)), nombreCompleto);

  function materiasCon(grupos) {
    const unicas = new Map();
    grupos.forEach((g) => g.materias.filter(tieneTemario).forEach((m) => unicas.set(m.id, m)));
    return MATERIAS.filter((m) => unicas.has(m.id));
  }

  function generar(docente, grupos) {
    const corto = [primeraPalabra(docente.nombre), primeraPalabra(docente.primerApellido)].filter(Boolean).join('_');
    const programas = [...new Set(grupos.map((g) => nombreDeCatalogo(PROGRAMAS_EDUCATIVOS, g.grupo.programaEducativo)))];
    setImpresiones((n) => n + 1);
    setDocumento(documentoPlanEstudios({
      materias: materiasCon(grupos),
      etiqueta: 'Temario',
      titulo: `Temario_${corto}_${cicloActivoId}`.replace(/\s+/g, '_'),
      institucion: PLANTEL?.institucion ?? '',
      programa: programas.join(' · '),
      detalles: [`Docente: ${nombreCompleto(docente)}`, `Grupos: ${grupos.map((g) => g.grupo.nombre).join(', ')}`, `Ciclo escolar: ${cicloActivoId}`],
      fecha: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
    }));
  }

  return (
    <div className="widget-temarios-docentes">
      <div className="widget-temarios-docentes-lista" ref={contenedorRef} onScroll={onScroll}>
        {docentes.length === 0 ? (
          <p className="widget-temarios-docentes-vacio">{soloPropios ? `No tienes materias inscritas en el ciclo ${cicloActivoId ?? ''}.` : `No hay docentes con materias inscritas en el ciclo ${cicloActivoId ?? ''}.`}</p>
        ) : docentes.map((d) => {
          const grupos = [...porDocente.get(d.id).values()];
          const disponible = materiasCon(grupos).length > 0;
          return (
          <section key={d.id} className="widget-temarios-docentes-card">
            <div className="widget-temarios-docentes-card-encabezado">
              <h3><i className="ri-user-line" /> {nombreCompleto(d)}</h3>
              <BotonS variant="claro" disabled={!disponible} onClick={() => generar(d, grupos)}>
                <i className="ri-file-pdf-2-line" /> PDF
              </BotonS>
            </div>
            {grupos.map((g) => (
                <div key={g.grupo.id} className="widget-temarios-docentes-grupo">
                  <div className="widget-temarios-docentes-grupo-info">
                    <strong>{g.grupo.nombre}</strong>
                    <ul>
                      {g.materias.map((m) => (
                        <li key={m.id}>{`${m.clave} · ${m.nombre}${tieneTemario(m) ? '' : ' (sin temario)'}`}</li>
                      ))}
                    </ul>
                  </div>
                </div>
            ))}
          </section>
          );
        })}
      </div>
      {thumb.visible && (
        <div className="widget-temarios-docentes-thumb" style={{ height: thumb.alto, top: thumb.top }} onMouseDown={onArrastrarThumb} />
      )}
      {documento && (
        <iframe
          key={impresiones}
          ref={iframeRef}
          className="widget-temarios-docentes-impresion"
          title="Temario para imprimir"
          srcDoc={documento}
          onLoad={() => imprimirDocumento(iframeRef.current?.contentWindow)}
        />
      )}
    </div>
  );
}
