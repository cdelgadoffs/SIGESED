import BadgeDinamico from '../base/BadgeDinamico.jsx';
import BotonS from '../base/BotonS.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useScrollbarPersonalizada } from '../../hooks/useScrollbarPersonalizada.js';
import { DIAS_SEMANA, ESTADOS_CICLO, diasDeSemana, fechaDia, fechaDiaMes, hoyLocal } from '../../utils/fechas.js';
import '../../styles/widgets/CalendarioSemanal.css';

const SEMANA_EXAMENES = 7;
const SEMANA_CIERRE = 8;

function estadoDe(desde, hasta, hoy) {
  if (hoy > hasta) return 'concluida';
  if (hoy >= desde) return 'actual';
  return 'proxima';
}

const ETIQUETAS = { concluida: 'Concluida', actual: 'En curso', proxima: 'Próxima' };

function Semana({ semana, asuetos, hoy }) {
  const estado = estadoDe(semana.inicio, semana.fin, hoy);
  const dias = diasDeSemana(semana, asuetos, hoy);
  const asuetosSemana = dias.filter((d) => d.asueto);
  let tipo = 'clase';
  if (semana.numero === SEMANA_EXAMENES) tipo = 'examenes';
  else if (semana.numero === SEMANA_CIERRE) tipo = 'cierre';
  return (
    <div className={`widget-calendario-semanal-semana widget-calendario-semanal-${tipo} widget-calendario-semanal-${estado}`}>
      <div className="widget-calendario-semanal-semana-encabezado">
        <span className="widget-calendario-semanal-semana-nombre">{semana.nombre}</span>
        <span className="widget-calendario-semanal-estado">{ETIQUETAS[estado]}</span>
      </div>
      <div className="widget-calendario-semanal-rango">{`${fechaDia(semana.inicio)} – ${fechaDia(semana.fin)}`}</div>
      <div className="widget-calendario-semanal-dias">
        {dias.map((d) => (
          <div
            key={d.fecha}
            className={'widget-calendario-semanal-dia'
              + (d.asueto ? ' widget-calendario-semanal-dia-asueto' : '')
              + (d.hoy ? ' widget-calendario-semanal-dia-hoy' : '')}
            title={`${fechaDia(d.fecha)}${d.asueto ? ' · Asueto' : ''}${d.hoy ? ' · Hoy' : ''}`}
          >
            <span className="widget-calendario-semanal-dia-nombre">{DIAS_SEMANA[d.diaSemana].slice(0, 2)}</span>
            <span className="widget-calendario-semanal-dia-numero">{d.dia}</span>
          </div>
        ))}
      </div>
      {asuetosSemana.length > 0 && (
        <div className="widget-calendario-semanal-nota">
          <i className="ri-calendar-close-line" />
          {`Asueto: ${asuetosSemana.map((d) => fechaDia(d.fecha)).join(', ')}`}
        </div>
      )}
    </div>
  );
}

function Vacaciones({ periodo, hoy }) {
  const estado = estadoDe(periodo.inicio, periodo.fin, hoy);
  return (
    <div className={`widget-calendario-semanal-semana widget-calendario-semanal-vacaciones widget-calendario-semanal-${estado}`}>
      <div className="widget-calendario-semanal-semana-encabezado">
        <span className="widget-calendario-semanal-semana-nombre">
          <i className="ri-sun-line" />
          {` Vacaciones · ${periodo.semanas} ${periodo.semanas === 1 ? 'semana' : 'semanas'}`}
        </span>
        <span className="widget-calendario-semanal-estado">{ETIQUETAS[estado]}</span>
      </div>
      <div className="widget-calendario-semanal-rango">{`${fechaDia(periodo.inicio)} – ${fechaDia(periodo.fin)}`}</div>
    </div>
  );
}

export default function CalendarioSemanal() {
  const { CICLOS, cicloActivoId, CARGA } = useRegistros();
  const { setCicloEnEdicionId, setGrupoEnInscripcionId } = useUI();
  const { contenedorRef, thumb, onScroll, onArrastrarThumb } = useScrollbarPersonalizada();
  const ciclo = CICLOS.find((c) => c.id === cicloActivoId);
  const hoy = hoyLocal();

  let contenido;
  if (!ciclo) {
    contenido = <p className="widget-calendario-semanal-mensaje">{CARGA.ciclos.cargando ? 'Cargando…' : 'Aún no hay ciclos escolares.'}</p>;
  } else {
    const estado = ESTADOS_CICLO[ciclo.estado] ?? ESTADOS_CICLO['sin-configurar'];
    const pendientes = (ciclo.pendientesInicio ?? []).filter((p) => p.paso === 'calendario');
    const editable = !ciclo.iniciado && !ciclo.cerrado;
    const filas = [
      ...(ciclo.semanas ?? []).map((s) => ({ tipo: 'semana', inicio: s.inicio, dato: s })),
      ...(ciclo.periodosVacacionales ?? []).map((v) => ({ tipo: 'vacaciones', inicio: v.inicio, dato: v })),
    ].sort((a, b) => a.inicio.localeCompare(b.inicio));

    contenido = (
      <>
        <div className="widget-calendario-semanal-resumen">
          <div className="widget-calendario-semanal-insignias">
            <BadgeDinamico texto={estado.texto} tono={estado.tono} />
            {ciclo.semanaActual && <BadgeDinamico texto={ciclo.semanaActual.nombre} icono="ri-calendar-event-line" tono="azul" />}
            {ciclo.asuetoHoy && <BadgeDinamico texto="Hoy es asueto" icono="ri-calendar-close-line" tono="naranja" />}
          </div>
          {ciclo.fechaInicio && (
            <div className="widget-calendario-semanal-periodo">{`${fechaDiaMes(ciclo.fechaInicio)} – ${fechaDiaMes(ciclo.fechaFin)}`}</div>
          )}
          {pendientes.length > 0 && (
            <ul className="widget-calendario-semanal-pendientes">
              {pendientes.map((p) => <li key={p.mensaje}>{p.mensaje}</li>)}
            </ul>
          )}
          {editable && ciclo.fechaInicio && (
            <BotonS
              variant="claro"
              onClick={() => {
                setGrupoEnInscripcionId(null);
                setCicloEnEdicionId(ciclo.id);
              }}
            >
              Editar calendario
            </BotonS>
          )}
        </div>
        {filas.length === 0 ? (
          <p className="widget-calendario-semanal-mensaje">Configura el calendario del ciclo para ver sus semanas.</p>
        ) : (
          <div className="widget-calendario-semanal-lista">
            {filas.map((f) => (f.tipo === 'semana'
              ? <Semana key={f.inicio} semana={f.dato} asuetos={ciclo.asuetos ?? []} hoy={hoy} />
              : <Vacaciones key={f.inicio} periodo={f.dato} hoy={hoy} />))}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="widget-calendario-semanal-wrap">
      <div className="widget-calendario-semanal" ref={contenedorRef} onScroll={onScroll}>
        {contenido}
      </div>
      {thumb.visible && (
        <div className="widget-calendario-semanal-thumb" style={{ height: thumb.alto, top: thumb.top }} onMouseDown={onArrastrarThumb} />
      )}
    </div>
  );
}
