import { useState } from 'react';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { LEMA } from '../../utils/boleta.js';
import '../../styles/widgets/PieSitio.css';

export default function PieSitio() {
  const { PLANTEL } = useRegistros();
  const { cuentaActiva, iniciarSesionMicrosoft } = useAuth();
  const { setVistaActual } = useUI();
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const datos = [
    { icono: 'ri-map-pin-line', texto: [PLANTEL?.domicilio, PLANTEL?.municipio].filter(Boolean).join(', ') },
    { icono: 'ri-phone-line', texto: PLANTEL?.telefono },
  ].filter((d) => d.texto);

  async function ingresar() {
    if (cuentaActiva) {
      setVistaActual('inicio');
      return;
    }
    setOcupado(true);
    setError(null);
    try {
      await iniciarSesionMicrosoft();
      setVistaActual('inicio');
    } catch (e) {
      setError(e?.mensaje ?? 'No se pudo ingresar.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <footer className="widget-pie-sitio">
      <div className="widget-pie-sitio-interior">
        <div>
          <strong>{PLANTEL?.institucion || 'Instituto'}</strong>
          {PLANTEL?.nombre && <span>{PLANTEL.nombre}</span>}
          <em>{LEMA}</em>
        </div>
        {datos.length > 0 && (
          <ul>
            {datos.map((d) => <li key={d.icono}><i className={d.icono} /> {d.texto}</li>)}
          </ul>
        )}
      </div>
      <div className="widget-pie-sitio-legal">
        <span>{`© ${new Date().getFullYear()} ${PLANTEL?.institucion || 'Instituto'}`}</span>
        <span className="widget-pie-sitio-ingreso">
          {error && <span className="widget-pie-sitio-error">{error}</span>}
          <button type="button" disabled={ocupado} onClick={ingresar}>Ingresar</button>
        </span>
      </div>
    </footer>
  );
}
