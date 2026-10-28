import '../../styles/base/CampoFormulario.css';

export default function CampoFormulario({ etiqueta, requerido = false, error, medio = false, children }) {
  return (
    <div className={'base-campo-formulario' + (medio ? ' base-campo-formulario-medio' : '')}>
      <label className="base-campo-formulario-etiqueta">
        {etiqueta}
        {requerido && <span className="base-campo-formulario-requerido"> *</span>}
      </label>
      {children}
      {error && <div className="base-campo-formulario-error">{error}</div>}
    </div>
  );
}
