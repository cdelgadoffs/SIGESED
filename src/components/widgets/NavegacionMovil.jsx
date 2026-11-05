import NavegacionInferior from '../base/NavegacionInferior.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { esAdministradorTI, moduloDeVista } from '../../utils/permisos.js';
import { SECCIONES_MOVIL } from '../../utils/movil.js';

export default function NavegacionMovil() {
  const { puede, rolesSesion, rolActivo } = useAuth();
  const { vistaActual, setVistaActual } = useUI();
  if (esAdministradorTI(rolesSesion.filter(rolActivo))) return null;
  const items = SECCIONES_MOVIL.filter((s) => s.siempre || puede(moduloDeVista(s.id)));
  return <NavegacionInferior items={items} activo={vistaActual} onElegir={setVistaActual} />;
}
