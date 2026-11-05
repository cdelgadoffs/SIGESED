import '../../styles/base/NavegacionInferior.css';

export default function NavegacionInferior({ items, activo, onElegir }) {
  return (
    <nav className="base-navegacion-inferior">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={'base-navegacion-inferior-boton' + (item.id === activo ? ' base-navegacion-inferior-activo' : '')}
          onClick={() => onElegir(item.id)}
        >
          <i className={item.icono} aria-hidden="true" />
          <span>{item.etiqueta}</span>
        </button>
      ))}
    </nav>
  );
}
