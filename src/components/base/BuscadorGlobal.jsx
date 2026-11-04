import { useState } from 'react';
import '../../styles/base/BuscadorGlobal.css';

export default function BuscadorGlobal({ value, onChange, placeholder = 'Buscar...', sugerencias, onElegir }) {
  const [abierto, setAbierto] = useState(false);
  const [resaltada, setResaltada] = useState(0);
  const lista = sugerencias ?? [];
  const mostrar = abierto && value.trim() !== '' && sugerencias !== undefined;

  function elegir(s) {
    setAbierto(false);
    if (onElegir) onElegir(s);
  }

  function teclas(e) {
    if (!mostrar) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setResaltada((i) => Math.min(i + 1, lista.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setResaltada((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && lista[resaltada]) {
      e.preventDefault();
      elegir(lista[resaltada]);
    } else if (e.key === 'Escape') {
      setAbierto(false);
    }
  }

  return (
    <div className="base-buscador-global">
      <input
        type="text"
        className="base-buscador-global-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setAbierto(true);
          setResaltada(0);
        }}
        onFocus={() => setAbierto(true)}
        onBlur={() => setAbierto(false)}
        onKeyDown={teclas}
      />
      {value && (
        <span className="base-buscador-global-limpiar" onClick={() => onChange('')}>
          ✕
        </span>
      )}
      {mostrar && (
        <ul className="base-buscador-global-sugerencias">
          {lista.length === 0 && <li className="base-buscador-global-vacio">Sin coincidencias.</li>}
          {lista.map((s, i) => (
            <li
              key={s.id}
              className={'base-buscador-global-sugerencia' + (i === resaltada ? ' base-buscador-global-sugerencia-resaltada' : '')}
              onMouseDown={(e) => {
                e.preventDefault();
                elegir(s);
              }}
              onMouseEnter={() => setResaltada(i)}
            >
              {s.icono && <i className={s.icono} aria-hidden="true"></i>}
              <span className="base-buscador-global-sugerencia-texto">{s.texto}</span>
              {s.insignia && (
                <span className={`base-buscador-global-insignia base-buscador-global-insignia-${s.insignia.tono}`}>{s.insignia.texto}</span>
              )}
              {s.detalle && <span className="base-buscador-global-sugerencia-detalle">{s.detalle}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
