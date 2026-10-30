import Topbar from '../components/widgets/Topbar.jsx';
import Sidebar1 from '../components/base/Sidebar1.jsx';
import Sidebar2 from '../components/base/Sidebar2.jsx';
import Sidebar3 from '../components/base/Sidebar3.jsx';
import Sidebar5 from '../components/base/Sidebar5.jsx';
import PanelPrincipal from '../components/base/PanelPrincipal.jsx';
import MenuPrincipal from '../components/widgets/MenuPrincipal.jsx';
import MenuPanelControl from '../components/widgets/MenuPanelControl.jsx';
import RolesSesion from '../components/widgets/RolesSesion.jsx';
import FiltroEstado from '../components/widgets/FiltroEstado.jsx';
import ListaPersonalSidebar from '../components/widgets/ListaPersonalSidebar.jsx';
import FichaPersonal from '../components/widgets/FichaPersonal.jsx';
import FormularioPersonal from '../components/widgets/FormularioPersonal.jsx';
import { useRegistros } from '../context/RegistrosContext.jsx';
import { useUI, ANCHO_SIDEBAR1, ANCHO_SIDEBAR2, ANCHO_SIDEBAR3, ALTO_TOPBAR } from '../context/UIContext.jsx';

export default function Personal() {
  const {
    izquierdaSidebar1,
    sidebar3Abierto, cerrarSidebar3, registroEnEdicionId,
    sidebar5Abierto, cerrarSidebar5, sidebar5Ancho,
  } = useUI();
  const { PLANTEL, PERSONAL } = useRegistros();
  const izquierdaSidebar2 = izquierdaSidebar1 + ANCHO_SIDEBAR1;
  const izquierdaSidebar3 = izquierdaSidebar2 + ANCHO_SIDEBAR2;
  const panelIzquierda = izquierdaSidebar3 + (sidebar3Abierto ? ANCHO_SIDEBAR3 : 0);

  return (
    <>
      <Topbar />
      <Sidebar1 izquierda={izquierdaSidebar1} arriba={ALTO_TOPBAR} titulo={PLANTEL?.nombre ?? 'SIGESED'} subtitulo={PLANTEL ? `CCT ${PLANTEL.cct}` : 'Sistema Integral de Gestión Educativa'}>
        <MenuPrincipal />
      </Sidebar1>
      <Sidebar2
        izquierda={izquierdaSidebar2}
        arriba={ALTO_TOPBAR}
        mostrarCerrar={false}
        badge="Personal administrativo"
        subtitulo={`${PERSONAL.length} ${PERSONAL.length === 1 ? 'persona' : 'personas'}`}
        accionesHeader={<FiltroEstado />}
      >
        <ListaPersonalSidebar />
      </Sidebar2>
      <Sidebar3
        abierto={sidebar3Abierto}
        izquierda={izquierdaSidebar3}
        arriba={ALTO_TOPBAR}
        badge={registroEnEdicionId ? 'Editar registro de personal' : 'Nuevo registro de personal'}
        onCerrar={cerrarSidebar3}
      >
        <FormularioPersonal />
      </Sidebar3>
      <Sidebar5 debajoTitulo={<RolesSesion />} abierto={sidebar5Abierto} ancho={sidebar5Ancho} arriba={ALTO_TOPBAR} onCerrar={cerrarSidebar5}>
        <MenuPanelControl />
      </Sidebar5>
      <PanelPrincipal izquierda={panelIzquierda} arriba={ALTO_TOPBAR}>
        <FichaPersonal />
      </PanelPrincipal>
    </>
  );
}
