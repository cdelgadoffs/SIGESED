import '../../styles/base/BuscadorGlobal.css';

export default function BuscadorGlobal({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <div className="base-buscador-global">
      <input
        type="text"
        className="base-buscador-global-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <span className="base-buscador-global-limpiar" onClick={() => onChange('')}>
          ✕
        </span>
      )}
    </div>
  );
}
