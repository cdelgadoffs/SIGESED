import Topbar from '../components/widgets/Topbar.jsx';
import Sidebar1 from '../components/base/Sidebar1.jsx';
import Sidebar2 from '../components/base/Sidebar2.jsx';
import Sidebar3 from '../components/base/Sidebar3.jsx';
import Sidebar5 from '../components/base/Sidebar5.jsx';
import PanelPrincipal from '../components/base/PanelPrincipal.jsx';
import MenuPrincipal from '../components/widgets/MenuPrincipal.jsx';
import MenuPanelControl from '../components/widgets/MenuPanelControl.jsx';
import RolesSesion from '../components/widgets/RolesSesion.jsx';
import ListaEstudiantesSidebar from '../components/widgets/ListaEstudiantesSidebar.jsx';
import FormularioReporte from '../components/widgets/FormularioReporte.jsx';
import ReportesEstudiante from '../components/widgets/ReportesEstudiante.jsx';
import { useRegistros } from '../context/RegistrosContext.jsx';
import { useUI, ANCHO_SIDEBAR1, ANCHO_SIDEBAR2, ANCHO_SIDEBAR3, ALTO_TOPBAR } from '../context/UIContext.jsx';

export default function BitacoraEstudiantil() {
  const { izquierdaSidebar1, sidebar5Abierto, cerrarSidebar5, sidebar5Ancho } = useUI();
  const { PLANTEL, CICLOS } = useRegistros();
  const cicloEnCurso = CICLOS.find((c) => c.estado === 'en-curso');
  const izquierdaSidebar2 = izquierdaSidebar1 + ANCHO_SIDEBAR1;
  const izquierdaSidebar3 = izquierdaSidebar2 + ANCHO_SIDEBAR2;
  const arriba = ALTO_TOPBAR;
  const panelIzquierda = izquierdaSidebar3 + ANCHO_SIDEBAR3;

  return (
    <>
      <Topbar />
      <Sidebar1 izquierda={izquierdaSidebar1} arriba={arriba} titulo={PLANTEL?.nombre ?? 'SIGESED'} subtitulo={PLANTEL?.institucion || 'Sistema Integral de Gestión Educativa'}>
        <MenuPrincipal />
      </Sidebar1>
      <Sidebar2
        izquierda={izquierdaSidebar2}
        arriba={arriba}
        mostrarCerrar={false}
        badge="Estudiantes"
        subtitulo="Estudiantes activos"
      >
        <ListaEstudiantesSidebar />
      </Sidebar2>
      <Sidebar3 izquierda={izquierdaSidebar3} arriba={arriba} mostrarCerrar={false} badge="Nuevo reporte"
        titulo={cicloEnCurso ? `Ciclo escolar ${cicloEnCurso.id}` : 'Sin ciclo escolar en curso'}
      >
        <FormularioReporte />
      </Sidebar3>
      <Sidebar5 debajoTitulo={<RolesSesion />} abierto={sidebar5Abierto} ancho={sidebar5Ancho} arriba={ALTO_TOPBAR} onCerrar={cerrarSidebar5}>
        <MenuPanelControl />
      </Sidebar5>
      <PanelPrincipal izquierda={panelIzquierda} arriba={arriba}>
        <ReportesEstudiante />
      </PanelPrincipal>
    </>
  );
}
