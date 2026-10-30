import BuscadorGlobal from '../base/BuscadorGlobal.jsx';
import FechaDia from '../base/FechaDia.jsx';
import BotonS from '../base/BotonS.jsx';
import BotonExpandible from '../base/BotonExpandible.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { filtrarEstudiantes, nombreCompleto } from '../../utils/registros.js';
import { useAjustesVisuales } from '../../context/AjustesVisualesContext.jsx';
import { NIVELES_BRILLO } from '../../utils/brillo.js';
import logo from '../../assets/SIGESED-BLACK-HORIZONTAL.jpg';
import '../../styles/widgets/Topbar.css';

const PREFIJO_BRILLO = 'brillo:';
const MAX_SUGERENCIAS = 8;

export default function Topbar({ opcionesConfiguracion = [], onSeleccionarConfiguracion }) {
  const { toggleSidebar5, terminoBusqueda, setTerminoBusqueda, setVistaActual, setRegistroSeleccionadoId, setRegistrosAbierto, setFiltroEstado } = useUI();
  const { ESTUDIANTES, GRUPOS } = useRegistros();
  const sugerencias = filtrarEstudiantes(ESTUDIANTES, GRUPOS, terminoBusqueda).slice(0, MAX_SUGERENCIAS).map((e) => ({
    id: e.id,
    texto: nombreCompleto(e),
    icono: 'ri-user-line',
    activo: e.activo !== false,
    insignia: e.activo === false ? { texto: 'Inactivo', tono: 'rojo' } : { texto: 'Activo', tono: 'verde' },
  }));

  function abrirEstudiante(sugerencia) {
    setVistaActual('estudiantes');
    setRegistrosAbierto(true);
    setRegistroSeleccionadoId(sugerencia.id);
    setFiltroEstado(sugerencia.activo ? 'activos' : 'inactivos');
    setTerminoBusqueda('');
  }
  const { cerrarSesion } = useAuth();
  const { brilloPantalla, cambiarAjuste } = useAjustesVisuales();
  const opcionesBrillo = NIVELES_BRILLO.map((nivel) => ({
    id: `${PREFIJO_BRILLO}${nivel}`,
    label: nivel === 0 ? 'Normal' : `Atenuado ${nivel} %`,
    grupo: 'Brillo de la pantalla',
    icono: nivel === brilloPantalla ? 'ri-radio-button-line' : 'ri-checkbox-blank-circle-line',
  }));

  function seleccionarConfiguracion(id) {
    if (id.startsWith(PREFIJO_BRILLO)) cambiarAjuste('brilloPantalla', Number(id.slice(PREFIJO_BRILLO.length)));
    else if (onSeleccionarConfiguracion) onSeleccionarConfiguracion(id);
  }

  return (
    <header className="widget-topbar">
      <div className="widget-topbar-left">
        <button type="button" className="widget-topbar-menu" aria-label="Alternar panel" onClick={toggleSidebar5}>☰</button>
        <img className="widget-topbar-logo" src={logo} alt="SIGESED" />
      </div>
      <div className="widget-topbar-right">
        <BuscadorGlobal
          value={terminoBusqueda}
          onChange={setTerminoBusqueda}
          placeholder="Buscar..."
          sugerencias={sugerencias}
          onElegir={abrirEstudiante}
        />
        <FechaDia />
        <BotonS onClick={cerrarSesion}>Salir</BotonS>
        <BotonExpandible
          icono="ri-settings-3-line"
          ariaLabel="Configuración visual"
          opciones={[...opcionesConfiguracion, ...opcionesBrillo]}
          onSeleccionar={seleccionarConfiguracion}
          textoVacio="Sin configuraciones en esta vista."
        />
      </div>
    </header>
  );
}
