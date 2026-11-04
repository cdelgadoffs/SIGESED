import { useState } from 'react';
import '../../styles/base/NavegacionPublica.css';

export default function NavegacionPublica({ logo, nombre, subtitulo, enlaces, activo, onNavegar, accion }) {
  const [abierto, setAbierto] = useState(false);

  function navegar(id) {
    setAbierto(false);
    onNavegar(id);
  }

  return (
    <header className="base-navegacion-publica">
      <button type="button" className="base-navegacion-publica-marca" onClick={() => navegar(enlaces[0]?.id)}>
        {logo && <img src={logo} alt="" />}
        <span>
          <strong>{nombre}</strong>
          {subtitulo && <small>{subtitulo}</small>}
        </span>
      </button>
      <button type="button" className="base-navegacion-publica-menu" aria-label="Menú" onClick={() => setAbierto((a) => !a)}>
        <i className={abierto ? 'ri-close-line' : 'ri-menu-line'} />
      </button>
      <nav className={'base-navegacion-publica-enlaces' + (abierto ? ' base-navegacion-publica-enlaces-abierto' : '')}>
        {enlaces.map((e) => (
          <button
            key={e.id}
            type="button"
            className={'base-navegacion-publica-enlace' + (e.id === activo ? ' base-navegacion-publica-enlace-activo' : '')}
            onClick={() => navegar(e.id)}
          >
            {e.texto}
          </button>
        ))}
        {accion && <span className="base-navegacion-publica-accion">{accion}</span>}
      </nav>
    </header>
  );
}
