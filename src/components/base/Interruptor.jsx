import '../../styles/base/Interruptor.css';

export default function Interruptor({ encendido, onCambiar, ariaLabel, disabled = false, tamano, textoEncendido, textoApagado }) {
  const texto = encendido ? textoEncendido : textoApagado;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={encendido}
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled}
      className={
        'base-interruptor' +
        (tamano === 'grande' ? ' base-interruptor-grande' : '') +
        (texto ? ' base-interruptor-con-texto' : '') +
        (encendido ? ' base-interruptor-encendido' : '')
      }
      onClick={(e) => {
        e.stopPropagation();
        if (onCambiar) onCambiar(!encendido);
      }}
    >
      {texto && <span className="base-interruptor-texto">{texto}</span>}
      <span className="base-interruptor-perilla"></span>
    </button>
  );
}
