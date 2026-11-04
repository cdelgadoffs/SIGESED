import NavegacionPublica from '../base/NavegacionPublica.jsx';
import BotonS from '../base/BotonS.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../../assets/Icom.jpg';
import '../../styles/widgets/NavegacionSitio.css';

const ENLACES_SITIO = [
  { id: 'publico:inicio', texto: 'Inicio' },
  { id: 'publico:nosotros', texto: 'Nosotros' },
  { id: 'publico:oferta', texto: 'Oferta educativa' },
  { id: 'publico:avisos', texto: 'Avisos' },
  { id: 'publico:galeria', texto: 'Galería' },
  { id: 'publico:admisiones', texto: 'Admisiones' },
];

export default function NavegacionSitio() {
  const { PLANTEL } = useRegistros();
  const { vistaActual, setVistaActual } = useUI();
  const { cuentaActiva } = useAuth();
  return (
    <NavegacionPublica
      logo={logo}
      nombre={PLANTEL?.institucion || 'Instituto'}
      subtitulo={PLANTEL?.nombre}
      enlaces={ENLACES_SITIO}
      activo={vistaActual}
      onNavegar={setVistaActual}
      accion={(
        <span className="widget-navegacion-sitio-acceso">
          {cuentaActiva ? (
            <BotonS onClick={() => setVistaActual('inicio')}>
              Ir al sistema
            </BotonS>
          ) : (
            <BotonS disabled>
              Acceder
            </BotonS>
          )}
        </span>
      )}
    />
  );
}
