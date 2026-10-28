import BotonSeleccionableMenu from '../base/BotonSeleccionableMenu.jsx';
import SubMenuDD from './SubMenuDD.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import '../../styles/widgets/MenuPrincipal.css';

const ITEMS_MENU_PRINCIPAL = [
  { id: 'inicio', label: 'Inicio' },
  {
    id: 'registros',
    label: 'Registros',
    hijos: [
      { id: 'personal', nombre: 'Personal administrativo', lista: 'PERSONAL' },
      { id: 'estudiantes', nombre: 'Estudiantes', lista: 'ESTUDIANTES' },
    ],
  },
];

export default function MenuPrincipal() {
  const registros = useRegistros();
  const { vistaActual, setVistaActual, abrirNuevoRegistro, registrosAbierto, setRegistrosAbierto } = useUI();

  function agregar(vista) {
    setVistaActual(vista);
    abrirNuevoRegistro();
  }

  return (
    <div className="widget-menu-principal">
      {ITEMS_MENU_PRINCIPAL.map((item) => {
        if (!item.hijos) {
          return (
            <BotonSeleccionableMenu key={item.id} activo={vistaActual === item.id} onClick={() => setVistaActual(item.id)}>
              {item.label}
            </BotonSeleccionableMenu>
          );
        }
        const activo = item.hijos.some((h) => h.id === vistaActual);
        return (
          <div key={item.id}>
            <BotonSeleccionableMenu
              activo={activo}
              expandible
              expandido={registrosAbierto}
              onClick={() => setRegistrosAbierto((a) => !a)}
            >
              {item.label}
            </BotonSeleccionableMenu>
            {registrosAbierto && (
              <SubMenuDD
                items={item.hijos.map((h) => ({ id: h.id, nombre: h.nombre, badge: registros[h.lista].length }))}
                activoId={vistaActual}
                onSeleccionar={setVistaActual}
                onAgregar={agregar}
                iconoAgregar="+"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
