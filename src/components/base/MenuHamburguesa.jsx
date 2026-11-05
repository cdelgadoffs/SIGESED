import { useState } from 'react';
import '../../styles/base/MenuHamburguesa.css';

export default function MenuHamburguesa({ items, activo, onElegir }) {
  const [abierto, setAbierto] = useState(false);

  function elegir(id) {
    setAbierto(false);
    onElegir(id);
  }

  return (
    <>
      <button type="button" className="base-menu-hamburguesa-boton" aria-label="Menú" aria-expanded={abierto} onClick={() => setAbierto((a) => !a)}>
        <i className={abierto ? 'ri-close-line' : 'ri-menu-line'} />
      </button>
      {abierto && (
        <>
          <div className="base-menu-hamburguesa-fondo" onClick={() => setAbierto(false)} />
          <nav className="base-menu-hamburguesa-panel">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={'base-menu-hamburguesa-item'
                  + (item.id === activo ? ' base-menu-hamburguesa-item-activo' : '')
                  + (item.separado ? ' base-menu-hamburguesa-item-separado' : '')}
                onClick={() => elegir(item.id)}
              >
                {item.icono && <i className={item.icono} aria-hidden="true" />}
                {item.texto}
              </button>
            ))}
          </nav>
        </>
      )}
    </>
  );
}
