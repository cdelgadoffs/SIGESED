import Topbar from '../components/widgets/Topbar.jsx';
import Sidebar1 from '../components/base/Sidebar1.jsx';
import Sidebar2 from '../components/base/Sidebar2.jsx';
import Sidebar3 from '../components/base/Sidebar3.jsx';
import Sidebar5 from '../components/base/Sidebar5.jsx';
import PanelPrincipal from '../components/base/PanelPrincipal.jsx';
import MenuPrincipal from '../components/widgets/MenuPrincipal.jsx';
import MenuPanelControl from '../components/widgets/MenuPanelControl.jsx';
import ListaEstudiantesSidebar from '../components/widgets/ListaEstudiantesSidebar.jsx';
import FormularioEvaluacion from '../components/widgets/FormularioEvaluacion.jsx';
import VistaPreviaBoleta from '../components/widgets/VistaPreviaBoleta.jsx';
import { useRegistros } from '../context/RegistrosContext.jsx';
import { useUI, ANCHO_SIDEBAR1, ANCHO_SIDEBAR2, ANCHO_SIDEBAR3, ALTO_TOPBAR } from '../context/UIContext.jsx';

export default function Evaluaciones() {
  const { izquierdaSidebar1, sidebar5Abierto, cerrarSidebar5, sidebar5Ancho } = useUI();
  const { PLANTEL, cicloActivoId } = useRegistros();
  const izquierdaSidebar2 = izquierdaSidebar1 + ANCHO_SIDEBAR1;
  const izquierdaSidebar3 = izquierdaSidebar2 + ANCHO_SIDEBAR2;
  const panelIzquierda = izquierdaSidebar3 + ANCHO_SIDEBAR3;

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
        badge="Evaluaciones"
        subtitulo={cicloActivoId ? `Ciclo escolar ${cicloActivoId}` : 'Sin ciclo escolar'}
      >
        <ListaEstudiantesSidebar />
      </Sidebar2>
      <Sidebar3 izquierda={izquierdaSidebar3} arriba={ALTO_TOPBAR} mostrarCerrar={false} badge="Captura de calificaciones">
        <FormularioEvaluacion />
      </Sidebar3>
      <Sidebar5 abierto={sidebar5Abierto} ancho={sidebar5Ancho} arriba={ALTO_TOPBAR} onCerrar={cerrarSidebar5}>
        <MenuPanelControl />
      </Sidebar5>
      <PanelPrincipal izquierda={panelIzquierda} arriba={ALTO_TOPBAR}>
        <VistaPreviaBoleta />
      </PanelPrincipal>
    </>
  );
}
