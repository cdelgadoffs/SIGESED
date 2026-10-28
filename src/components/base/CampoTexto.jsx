import { useEffect, useRef } from 'react';
import '../../styles/base/CampoTexto.css';

export default function CampoTexto({ value, onChange, tipo = 'text', onEnter, placeholder, disabled, ariaLabel, enfocar }) {
  const ref = useRef(null);

  useEffect(() => {
    if (enfocar && ref.current) ref.current.focus({ preventScroll: true });
  }, [enfocar]);

  return (
    <input
      ref={ref}
      type={tipo}
      className="base-campo-texto"
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      aria-label={ariaLabel ?? placeholder}
      onChange={(e) => onChange && onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onEnter) {
          e.preventDefault();
          onEnter();
        }
      }}
    />
  );
}
