import NavegacionInferior from '../base/NavegacionInferior.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { moduloDeVista } from '../../utils/permisos.js';

const ITEMS_NAVEGACION_MOVIL = [
  { id: 'inicio', etiqueta: 'Inicio', icono: 'ri-home-4-line', siempre: true },
  { id: 'horarios', etiqueta: 'Horario', icono: 'ri-time-line' },
  { id: 'bitacora', etiqueta: 'Bitácora', icono: 'ri-draft-line' },
];

export default function NavegacionMovil() {
  const { puede } = useAuth();
  const { vistaActual, setVistaActual } = useUI();
  const items = ITEMS_NAVEGACION_MOVIL.filter((i) => i.siempre || puede(moduloDeVista(i.id)));
  return <NavegacionInferior items={items} activo={vistaActual} onElegir={setVistaActual} />;
}
