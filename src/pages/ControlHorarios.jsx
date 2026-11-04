import Topbar from '../components/widgets/Topbar.jsx';
import CintaCiclos from '../components/widgets/CintaCiclos.jsx';
import HorarioCiclo from '../components/widgets/HorarioCiclo.jsx';
import Sidebar1 from '../components/base/Sidebar1.jsx';
import Sidebar4 from '../components/base/Sidebar4.jsx';
import Sidebar5 from '../components/base/Sidebar5.jsx';
import TemariosDocentes from '../components/widgets/TemariosDocentes.jsx';
import PanelPrincipal from '../components/base/PanelPrincipal.jsx';
import MenuPrincipal from '../components/widgets/MenuPrincipal.jsx';
import MenuPanelControl from '../components/widgets/MenuPanelControl.jsx';
import RolesSesion from '../components/widgets/RolesSesion.jsx';
import { useRegistros } from '../context/RegistrosContext.jsx';
import { useUI, ANCHO_SIDEBAR1, ANCHO_SIDEBAR4, ALTO_TOPBAR, ALTO_CINTA } from '../context/UIContext.jsx';

export default function ControlHorarios() {
  const { izquierdaSidebar1, sidebar5Abierto, cerrarSidebar5, sidebar5Ancho } = useUI();
  const { PLANTEL, cicloActivoId } = useRegistros();
  const arriba = ALTO_TOPBAR + ALTO_CINTA;

  return (
    <>
      <Topbar />
      <CintaCiclos />
      <Sidebar1 izquierda={izquierdaSidebar1} arriba={arriba} titulo={PLANTEL?.nombre ?? 'SIGESED'} subtitulo={PLANTEL?.institucion || 'Sistema Integral de Gestión Educativa'}>
        <MenuPrincipal />
      </Sidebar1>
      <Sidebar5 debajoTitulo={<RolesSesion />} abierto={sidebar5Abierto} ancho={sidebar5Ancho} arriba={ALTO_TOPBAR} onCerrar={cerrarSidebar5}>
        <MenuPanelControl />
      </Sidebar5>
      <Sidebar4 abierto={!!cicloActivoId} mostrarCerrar={false} titulo={`Temarios ${cicloActivoId ?? ''}`} arriba={arriba}>
        <TemariosDocentes />
      </Sidebar4>
      <PanelPrincipal izquierda={izquierdaSidebar1 + ANCHO_SIDEBAR1} derecha={cicloActivoId ? ANCHO_SIDEBAR4 : 0} arriba={arriba}>
        <HorarioCiclo />
      </PanelPrincipal>
    </>
  );
}
