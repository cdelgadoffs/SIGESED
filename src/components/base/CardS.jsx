import '../../styles/base/CardS.css';

export default function CardS({ estado, titulo, subtitulo, estadoLabel, onClick, onEliminar, eliminarDeshabilitado }) {
  return (
    <div className={'base-card-s' + (estado ? ' base-card-s-' + estado : '')} onClick={onClick}>
      <div className="base-card-s-top">
        <span className="base-card-s-titulo">{titulo}</span>
        {estadoLabel && <span className="base-card-s-estado">{estadoLabel}</span>}
      </div>
      <div className="base-card-s-bottom">
        <span className="base-card-s-subtitulo">{subtitulo}</span>
        {onEliminar && (
          <button
            type="button"
            className="base-card-s-eliminar"
            disabled={eliminarDeshabilitado}
            title={eliminarDeshabilitado ? 'No se puede eliminar' : 'Eliminar'}
            onClick={(e) => { e.stopPropagation(); onEliminar(); }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
