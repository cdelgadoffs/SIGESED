import '../../styles/base/BotonS.css';

export default function BotonS({ onClick, disabled, variant = 'oscuro', children }) {
  return (
    <button type="button" className={'base-boton-s base-boton-s-' + variant} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
