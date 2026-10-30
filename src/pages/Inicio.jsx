import Topbar from '../components/widgets/Topbar.jsx';
import CintaCiclos from '../components/widgets/CintaCiclos.jsx';
import Sidebar1 from '../components/base/Sidebar1.jsx';
import Sidebar5 from '../components/base/Sidebar5.jsx';
import PanelPrincipal from '../components/base/PanelPrincipal.jsx';
import MenuPrincipal from '../components/widgets/MenuPrincipal.jsx';
import MenuPanelControl from '../components/widgets/MenuPanelControl.jsx';
import RolesSesion from '../components/widgets/RolesSesion.jsx';
import CalendarioCiclo from '../components/widgets/CalendarioCiclo.jsx';
import FormularioCiclo from '../components/widgets/FormularioCiclo.jsx';
import Sidebar3 from '../components/base/Sidebar3.jsx';
import { useRegistros } from '../context/RegistrosContext.jsx';
import { useUI, ANCHO_SIDEBAR1, ANCHO_SIDEBAR3, ALTO_TOPBAR, ALTO_CINTA } from '../context/UIContext.jsx';

export default function Inicio() {
  const { izquierdaSidebar1, sidebar5Abierto, cerrarSidebar5, sidebar5Ancho, cicloEnEdicionId, setCicloEnEdicionId } = useUI();
  const { PLANTEL, CICLOS, cicloActivoId } = useRegistros();
  const estadoCiclo = CICLOS.find((c) => c.id === cicloActivoId)?.estado;
  const editando = !!cicloActivoId && cicloEnEdicionId === cicloActivoId;
  const formularioAbierto = estadoCiclo === 'sin-configurar' || editando;
  const izquierdaSidebar3 = izquierdaSidebar1 + ANCHO_SIDEBAR1;
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
      <Sidebar3
        abierto={formularioAbierto}
        izquierda={izquierdaSidebar3}
        arriba={arriba}
        badge={editando ? `Editar ciclo ${cicloActivoId}` : `Configurar ciclo ${cicloActivoId ?? ''}`}
        mostrarCerrar={editando}
        onCerrar={() => setCicloEnEdicionId(null)}
      >
        <FormularioCiclo />
      </Sidebar3>
      <PanelPrincipal izquierda={izquierdaSidebar3 + (formularioAbierto ? ANCHO_SIDEBAR3 : 0)} arriba={arriba}>
        <CalendarioCiclo />
      </PanelPrincipal>
    </>
  );
}
