import { useState } from 'react';
import ListaExpandible from '../base/ListaExpandible.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { clasesDelCiclo } from '../../utils/inscripciones.js';
import { COLORES_DIA } from '../../utils/horarioEscolar.js';
import { DIAS_SEMANA } from '../../utils/fechas.js';
import { esSoloDocente } from '../../utils/permisos.js';
import { nombreCompleto, ordenarPorTexto } from '../../utils/registros.js';
import '../../styles/widgets/HorarioMovil.css';

const TODOS = 'todos';
const sinCero = (hora) => hora.replace(/^0/, '');

function Clase({ clase, materias, grupos, personal, mostrarDocente }) {
  const materia = materias.find((m) => m.id === clase.materia);
  const grupo = grupos.find((g) => g.id === clase.grupoId);
  const docente = personal.find((p) => p.id === clase.docenteId);
  const color = COLORES_DIA[clase.dia] ?? COLORES_DIA[1];
  return (
    <div className="widget-horario-movil-clase" style={{ borderLeftColor: color.acento }}>
      <span className="widget-horario-movil-clase-hora">{`${sinCero(clase.inicio)} – ${sinCero(clase.fin)}`}</span>
      <span className="widget-horario-movil-clase-materia">{materia?.nombre ?? clase.materia}</span>
      <span className="widget-horario-movil-clase-detalle">
        {[grupo?.nombre, materia?.clave, mostrarDocente && docente ? nombreCompleto(docente) : null].filter(Boolean).join(' · ')}
      </span>
    </div>
  );
}

export default function HorarioMovil() {
  const { CICLOS, cicloActivoId, INSCRIPCIONES, MATERIAS, GRUPOS, PERSONAL, HORAS_CLASE, CARGA } = useRegistros();
  const { cuentaActiva, rolesSesion, rolActivo } = useAuth();
  const [grupoId, setGrupoId] = useState(TODOS);
  const ciclo = CICLOS.find((c) => c.id === cicloActivoId);

  if (!ciclo) {
    return <p className="widget-horario-movil-mensaje">{CARGA.ciclos.cargando ? 'Cargando…' : 'Aún no hay ciclos escolares.'}</p>;
  }

  const soloPropias = esSoloDocente(rolesSesion.filter(rolActivo));
  const todas = clasesDelCiclo(INSCRIPCIONES, ciclo.id, HORAS_CLASE);
  const visibles = soloPropias ? todas.filter((c) => c.docenteId === cuentaActiva?.usuario) : todas;
  const grupos = ordenarPorTexto(GRUPOS.filter((g) => visibles.some((c) => c.grupoId === g.id)), (g) => g.nombre);
  const clases = grupoId === TODOS ? visibles : visibles.filter((c) => c.grupoId === grupoId);
  const hoy = new Date().getDay();
  const deHoy = clases.filter((c) => c.dia === hoy);
  const dias = [...new Set(clases.map((c) => c.dia))].sort((a, b) => a - b);
  const comunes = { materias: MATERIAS, grupos: GRUPOS, personal: PERSONAL, mostrarDocente: !soloPropias };
  const opciones = [{ id: TODOS, label: 'Todos los grupos' }, ...grupos.map((g) => ({ id: g.id, label: g.nombre }))];

  return (
    <div className="widget-horario-movil">
      {!ciclo.iniciado && <p className="widget-horario-movil-aviso">{`El ciclo ${ciclo.id} está en preparación: el horario aún puede cambiar.`}</p>}
      {grupos.length > 1 && (
        <div className="widget-horario-movil-filtro">
          <ListaExpandible
            valorActual={grupoId}
            etiquetaActual={opciones.find((o) => o.id === grupoId)?.label}
            opciones={opciones}
            onSeleccionar={setGrupoId}
          />
        </div>
      )}

      <section className="widget-horario-movil-seccion">
        <h2>{`Hoy · ${DIAS_SEMANA[hoy]}`}</h2>
        {deHoy.length === 0
          ? <p className="widget-horario-movil-vacio">Sin clases hoy.</p>
          : deHoy.map((c, i) => <Clase key={i} clase={c} {...comunes} />)}
      </section>

      {clases.length === 0 ? (
        <p className="widget-horario-movil-mensaje">
          {soloPropias ? `No tienes clases con horario en el ciclo ${ciclo.id}.` : `No hay clases con horario en el ciclo ${ciclo.id}.`}
        </p>
      ) : (
        <section className="widget-horario-movil-seccion">
          <h2>Semana</h2>
          {dias.map((dia) => (
            <div key={dia} className="widget-horario-movil-dia">
              <span className="widget-horario-movil-dia-nombre" style={{ background: COLORES_DIA[dia]?.fondo }}>{DIAS_SEMANA[dia]}</span>
              {clases.filter((c) => c.dia === dia).map((c, i) => <Clase key={i} clase={c} {...comunes} />)}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
