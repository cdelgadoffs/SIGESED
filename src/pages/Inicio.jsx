import Topbar from '../components/widgets/Topbar.jsx';
import CintaCiclos from '../components/widgets/CintaCiclos.jsx';
import Sidebar1 from '../components/base/Sidebar1.jsx';
import Sidebar5 from '../components/base/Sidebar5.jsx';
import PanelPrincipal from '../components/base/PanelPrincipal.jsx';
import MenuPrincipal from '../components/widgets/MenuPrincipal.jsx';
import MenuPanelControl from '../components/widgets/MenuPanelControl.jsx';
import { useRegistros } from '../context/RegistrosContext.jsx';
import { useUI, ANCHO_SIDEBAR1, ALTO_TOPBAR, ALTO_CINTA } from '../context/UIContext.jsx';

export default function Inicio() {
  const { izquierdaSidebar1, sidebar5Abierto, cerrarSidebar5, sidebar5Ancho } = useUI();
  const { PLANTEL } = useRegistros();
  const arriba = ALTO_TOPBAR + ALTO_CINTA;

  return (
    <>
      <Topbar />
      <CintaCiclos />
      <Sidebar1 izquierda={izquierdaSidebar1} arriba={arriba} titulo={PLANTEL?.nombre ?? 'SIGESED'} subtitulo={PLANTEL ? `CCT ${PLANTEL.cct}` : 'Sistema Integral de Gestión Educativa'}>
        <MenuPrincipal />
      </Sidebar1>
      <Sidebar5 abierto={sidebar5Abierto} ancho={sidebar5Ancho} arriba={ALTO_TOPBAR} onCerrar={cerrarSidebar5}>
        <MenuPanelControl />
      </Sidebar5>
      <PanelPrincipal izquierda={izquierdaSidebar1 + ANCHO_SIDEBAR1} arriba={arriba}>
        <div style={{ textAlign: 'center', color: '#555' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 600, color: '#1a1a1a' }}>Sistema Integral de Gestión Educativa</h1>
          <p style={{ margin: 0, fontSize: 14 }}>Elige una opción de «Matrícula» en el menú para empezar.</p>
        </div>
      </PanelPrincipal>
    </>
  );
}
