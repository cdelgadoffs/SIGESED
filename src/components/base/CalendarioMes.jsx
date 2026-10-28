import '../../styles/base/CalendarioMes.css';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DIAS_SEMANA = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

export default function CalendarioMes({ mes, onCambiarMes, fechasSeleccionadas = [], onSeleccionarFecha, diasOcupados = [] }) {
  const [anio, mesNum] = mes.split('-').map(Number);
  const primerDiaSemana = new Date(anio, mesNum - 1, 1).getDay();
  const diasEnMes = new Date(anio, mesNum, 0).getDate();

  const celdas = [];
  for (let i = 0; i < primerDiaSemana; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) {
    celdas.push(`${anio}-${String(mesNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }

  return (
    <div className="base-calendario-mes">
      <div className="base-calendario-mes-header">
        <button type="button" className="base-calendario-mes-nav" onClick={() => onCambiarMes(-1)}>◀</button>
        <span className="base-calendario-mes-titulo">{MESES[mesNum - 1]} {anio}</span>
        <button type="button" className="base-calendario-mes-nav" onClick={() => onCambiarMes(1)}>▶</button>
      </div>
      <div className="base-calendario-mes-grid">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="base-calendario-mes-dia-semana">{d}</div>
        ))}
        {celdas.map((fecha, idx) => {
          if (!fecha) return <div key={`vacio-${idx}`} className="base-calendario-mes-dia-vacio" />;
          const dia = parseInt(fecha.split('-')[2], 10);
          const ocupado = diasOcupados.includes(fecha);
          const seleccionado = fechasSeleccionadas.includes(fecha);
          return (
            <div
              key={fecha}
              className={
                'base-calendario-mes-dia' +
                (seleccionado ? ' base-calendario-mes-dia-seleccionado' : '') +
                (ocupado ? ' base-calendario-mes-dia-ocupado' : '')
              }
              onClick={() => onSeleccionarFecha(fecha)}
            >
              {dia}
            </div>
          );
        })}
      </div>
    </div>
  );
}
