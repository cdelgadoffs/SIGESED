import '../../styles/base/IndicadorSync.css';

const ESTADOS = {
  servidor: { icono: 'ri-cloud-line', texto: 'Guardado en el servidor' },
  local: { icono: 'ri-computer-line', texto: 'Guardado solo en este equipo' },
  error: { icono: 'ri-error-warning-line', texto: 'Error de sincronización' },
};

export default function IndicadorSync({ estado = 'servidor' }) {
  const { icono, texto } = ESTADOS[estado] || ESTADOS.servidor;
  return (
    <span className={`base-indicador-sync base-indicador-sync-${estado}`} title={texto} aria-label={texto}>
      <i className={icono}></i>
    </span>
  );
}
