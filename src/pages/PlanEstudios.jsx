import Topbar from '../components/widgets/Topbar.jsx';
import Sidebar1 from '../components/base/Sidebar1.jsx';
import Sidebar2 from '../components/base/Sidebar2.jsx';
import Sidebar5 from '../components/base/Sidebar5.jsx';
import PanelPrincipal from '../components/base/PanelPrincipal.jsx';
import MenuPrincipal from '../components/widgets/MenuPrincipal.jsx';
import MenuPanelControl from '../components/widgets/MenuPanelControl.jsx';
import RolesSesion from '../components/widgets/RolesSesion.jsx';
import ListaPlanEstudios from '../components/widgets/ListaPlanEstudios.jsx';
import FichaMateria from '../components/widgets/FichaMateria.jsx';
import ResumenPlanEstudios from '../components/widgets/ResumenPlanEstudios.jsx';
import { useRegistros } from '../context/RegistrosContext.jsx';
import { useUI, ANCHO_SIDEBAR1, ANCHO_SIDEBAR2, ANCHO_SIDEBAR2_AMPLIO, ALTO_TOPBAR } from '../context/UIContext.jsx';

export default function PlanEstudios() {
  const { izquierdaSidebar1, sidebar5Abierto, cerrarSidebar5, sidebar5Ancho, registroSeleccionadoId, sidebar2Amplio } = useUI();
  const { PLANTEL, MATERIAS } = useRegistros();
  const izquierdaSidebar2 = izquierdaSidebar1 + ANCHO_SIDEBAR1;
  const anchoSidebar2 = sidebar2Amplio ? ANCHO_SIDEBAR2_AMPLIO : ANCHO_SIDEBAR2;

  return (
    <>
      <Topbar />
      <Sidebar1 izquierda={izquierdaSidebar1} arriba={ALTO_TOPBAR} titulo={PLANTEL?.nombre ?? 'SIGESED'} subtitulo={PLANTEL?.institucion || 'Sistema Integral de Gestión Educativa'}>
        <MenuPrincipal />
      </Sidebar1>
      <Sidebar2
        izquierda={izquierdaSidebar2}
        ancho={anchoSidebar2}
        arriba={ALTO_TOPBAR}
        mostrarCerrar={false}
        badge="Plan de estudios"
        subtitulo={`${MATERIAS.length} ${MATERIAS.length === 1 ? 'materia' : 'materias'}`}
      >
        <ListaPlanEstudios />
      </Sidebar2>
      <Sidebar5 debajoTitulo={<RolesSesion />} abierto={sidebar5Abierto} ancho={sidebar5Ancho} arriba={ALTO_TOPBAR} onCerrar={cerrarSidebar5}>
        <MenuPanelControl />
      </Sidebar5>
      <PanelPrincipal izquierda={izquierdaSidebar2 + anchoSidebar2} arriba={ALTO_TOPBAR}>
        {registroSeleccionadoId ? <FichaMateria /> : <ResumenPlanEstudios />}
      </PanelPrincipal>
    </>
  );
}
