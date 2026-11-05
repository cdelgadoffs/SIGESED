import MenuHamburguesa from '../base/MenuHamburguesa.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAjustesVisuales } from '../../context/AjustesVisualesContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { moduloDeVista } from '../../utils/permisos.js';
import { MODULOS_SOLO_ESCRITORIO, SECCIONES_MOVIL } from '../../utils/movil.js';

const ESCRITORIO = 'accion:escritorio';
const SALIR = 'accion:salir';

export default function MenuMovil() {
  const { puede, cerrarSesion } = useAuth();
  const { cambiarAjuste } = useAjustesVisuales();
  const { vistaActual, setVistaActual } = useUI();
  const items = [
    ...SECCIONES_MOVIL.filter((s) => s.siempre || puede(moduloDeVista(s.id))).map((s) => ({ id: s.id, texto: s.etiqueta, icono: s.icono })),
    ...MODULOS_SOLO_ESCRITORIO.filter((m) => puede(moduloDeVista(m.id))).map((m, i) => ({ id: `${ESCRITORIO}:${m.id}`, texto: m.etiqueta, icono: m.icono, separado: i === 0 })),
    { id: ESCRITORIO, texto: 'Versión de escritorio', icono: 'ri-computer-line', separado: true },
    { id: SALIR, texto: 'Salir', icono: 'ri-logout-box-r-line' },
  ];

  async function elegir(id) {
    if (id.startsWith(ESCRITORIO)) {
      cambiarAjuste('vistaSistema', 'escritorio');
      if (id !== ESCRITORIO) setVistaActual(id.slice(ESCRITORIO.length + 1));
    }
    else if (id === SALIR) {
      await cerrarSesion();
      setVistaActual('publico:inicio');
    } else setVistaActual(id);
  }

  return <MenuHamburguesa items={items} activo={vistaActual} onElegir={elegir} />;
}
