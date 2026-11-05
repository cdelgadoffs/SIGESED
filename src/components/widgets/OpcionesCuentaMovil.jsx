import BotonIcono from '../base/BotonIcono.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAjustesVisuales } from '../../context/AjustesVisualesContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import '../../styles/widgets/OpcionesCuentaMovil.css';

export default function OpcionesCuentaMovil() {
  const { cerrarSesion } = useAuth();
  const { cambiarAjuste } = useAjustesVisuales();
  const { setVistaActual } = useUI();
  return (
    <div className="widget-opciones-cuenta-movil">
      <BotonIcono icono="ri-computer-line" ariaLabel="Versión de escritorio" onClick={() => cambiarAjuste('vistaSistema', 'escritorio')} />
      <BotonIcono
        icono="ri-logout-box-r-line"
        ariaLabel="Salir"
        onClick={async () => { await cerrarSesion(); setVistaActual('publico:inicio'); }}
      />
    </div>
  );
}
