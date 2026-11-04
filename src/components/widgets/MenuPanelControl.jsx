import BotonSeleccionablePanel from '../base/BotonSeleccionablePanel.jsx';
import DatosPlantel from '../../pages/panelcontrol/DatosPlantel.jsx';
import CalendarizacionAnual from '../../pages/panelcontrol/CalendarizacionAnual.jsx';
import { useUI } from '../../context/UIContext.jsx';

const ITEMS_PANEL_CONTROL = [
  { id: 'plantel', label: 'Datos del plantel', Panel: DatosPlantel },
  { id: 'calendarizacion', label: 'Calendarización anual', Panel: CalendarizacionAnual },
];

export default function MenuPanelControl() {
  const { panelControlActivo, setPanelControlActivo } = useUI();
  const activo = ITEMS_PANEL_CONTROL.find((i) => i.id === panelControlActivo);

  if (activo) {
    const Panel = activo.Panel;
    return <Panel />;
  }

  return (
    <>
      {ITEMS_PANEL_CONTROL.map((item) => (
        <BotonSeleccionablePanel key={item.id} onClick={() => setPanelControlActivo(item.id)}>
          {item.label}
        </BotonSeleccionablePanel>
      ))}
    </>
  );
}
