import Card from '../base/Card.jsx';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import BotonS from '../base/BotonS.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { ESTADOS_CICLO, fechaCorta } from '../../utils/fechas.js';
import '../../styles/widgets/CalendarioCiclo.css';

function Calendario({ ciclo }) {
  const filas = [
    ...ciclo.semanas.map((s) => ({ ...s, tipo: 'semana' })),
    ...ciclo.periodosVacacionales.map((v) => ({ ...v, nombre: `Vacaciones (${v.semanas} ${v.semanas === 1 ? 'semana' : 'semanas'})`, tipo: 'vacaciones' })),
  ].sort((a, b) => a.inicio.localeCompare(b.inicio));
  const actual = ciclo.semanaActual?.nombre;

  return (
    <div className="widget-calendario-ciclo-calendario">
      {filas.map((f) => {
        const esActual = actual && ((f.tipo === 'semana' && f.numero === ciclo.semanaActual.numero) || (f.tipo === 'vacaciones' && ciclo.semanaActual.numero === null));
        return (
          <div
            key={f.inicio}
            className={
              'widget-calendario-ciclo-semana'
              + (f.tipo === 'vacaciones' ? ' widget-calendario-ciclo-semana-vacaciones' : '')
              + (esActual ? ' widget-calendario-ciclo-semana-actual' : '')
            }
          >
            <span className="widget-calendario-ciclo-semana-nombre">{f.nombre}</span>
            <span className="widget-calendario-ciclo-semana-fechas">{fechaCorta(f.inicio)} – {fechaCorta(f.fin)}</span>
          </div>
        );
      })}
      {ciclo.asuetos.length > 0 && (
        <div className="widget-calendario-ciclo-asuetos">
          <span>Asuetos:</span>
          {ciclo.asuetos.map((a) => <BadgeDinamico key={a} texto={fechaCorta(a)} icono="ri-calendar-close-line" tono="naranja" />)}
        </div>
      )}
    </div>
  );
}

export default function CalendarioCiclo() {
  const { CICLOS, cicloActivoId, CARGA } = useRegistros();
  const { abrirPanelControl } = useUI();
  const ciclo = CICLOS.find((c) => c.id === cicloActivoId);

  if (!ciclo) {
    return (
      <div className="widget-calendario-ciclo-mensaje">
        <p>{CARGA.ciclos.cargando ? 'Cargando…' : 'Aún no hay ciclos escolares.'}</p>
        {!CARGA.ciclos.cargando && <BotonS variant="claro" onClick={() => abrirPanelControl('calendarizacion')}>Crear la calendarización anual</BotonS>}
      </div>
    );
  }

  const estado = ESTADOS_CICLO[ciclo.estado] ?? ESTADOS_CICLO['sin-configurar'];

  return (
    <div className="widget-calendario-ciclo">
      <Card>
        <div className="widget-calendario-ciclo-encabezado">
          <span className="widget-calendario-ciclo-titulo">Ciclo escolar {ciclo.id}</span>
          {ciclo.semanaActual && <BadgeDinamico texto={ciclo.semanaActual.nombre} icono="ri-calendar-event-line" tono="azul" />}
          {ciclo.asuetoHoy && <BadgeDinamico texto="Hoy es asueto" icono="ri-calendar-close-line" tono="naranja" />}
          <BadgeDinamico texto={estado.texto} tono={estado.tono} />
        </div>
        <div className="widget-calendario-ciclo-cuerpo">
          {ciclo.semanas.length > 0
            ? <Calendario ciclo={ciclo} />
            : <p className="widget-calendario-ciclo-vacio">Configura la fecha de inicio del ciclo para calcular sus semanas.</p>}
        </div>
      </Card>
    </div>
  );
}
