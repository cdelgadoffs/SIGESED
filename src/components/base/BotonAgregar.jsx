import '../../styles/base/BotonAgregar.css';

export default function BotonAgregar({ onClick, etiqueta, children }) {
  return (
    <button
      type="button"
      className={'base-boton-agregar' + (etiqueta ? ' base-boton-agregar-expandible' : '')}
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick();
      }}
    >
      {children}
      {etiqueta && <span className="base-boton-agregar-etiqueta">{etiqueta}</span>}
    </button>
  );
}
