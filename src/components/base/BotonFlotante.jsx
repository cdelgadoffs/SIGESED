import '../../styles/base/BotonFlotante.css';

export default function BotonFlotante({ icono, etiqueta, onClick }) {
  return (
    <button type="button" className="base-boton-flotante" onClick={onClick} aria-label={etiqueta}>
      <i className={icono} aria-hidden="true" />
      <span>{etiqueta}</span>
    </button>
  );
}
