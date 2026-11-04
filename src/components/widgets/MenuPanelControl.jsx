import BotonSeleccionablePanel from '../base/BotonSeleccionablePanel.jsx';
import DatosPlantel from '../../pages/panelcontrol/DatosPlantel.jsx';
import CalendarizacionAnual from '../../pages/panelcontrol/CalendarizacionAnual.jsx';
import Respaldos from '../../pages/panelcontrol/Respaldos.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUI } from '../../context/UIContext.jsx';

const ITEMS_PANEL_CONTROL = [
  { id: 'plantel', label: 'Datos del plantel', Panel: DatosPlantel, modulo: 'panelControl', nivel: 'editar' },
  { id: 'calendarizacion', label: 'Calendarización anual', Panel: CalendarizacionAnual, modulo: 'panelControl' },
  { id: 'respaldos', label: 'Respaldos', Panel: Respaldos, rol: 'administrador-ti' },
];

export default function MenuPanelControl() {
  const { panelControlActivo, setPanelControlActivo } = useUI();
  const { rolesSesion, puede } = useAuth();
  const items = ITEMS_PANEL_CONTROL.filter((i) => (!i.rol || rolesSesion.includes(i.rol)) && (!i.modulo || puede(i.modulo, i.nivel)));
  const activo = items.find((i) => i.id === panelControlActivo);

  if (activo) {
    const Panel = activo.Panel;
    return <Panel />;
  }

  return (
    <>
      {items.map((item) => (
        <BotonSeleccionablePanel key={item.id} onClick={() => setPanelControlActivo(item.id)}>
          {item.label}
        </BotonSeleccionablePanel>
      ))}
    </>
  );
}
