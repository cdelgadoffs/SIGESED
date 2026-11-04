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
import ListaEstudiantesSidebar from '../components/widgets/ListaEstudiantesSidebar.jsx';
import FormularioKardex from '../components/widgets/FormularioKardex.jsx';
import KardexEstudiante from '../components/widgets/KardexEstudiante.jsx';
import BadgeDinamico from '../components/base/BadgeDinamico.jsx';
import { useRegistros } from '../context/RegistrosContext.jsx';
import { useUI, ANCHO_SIDEBAR1, ANCHO_SIDEBAR2, ANCHO_SIDEBAR3, ALTO_TOPBAR } from '../context/UIContext.jsx';

export default function Kardex() {
  const {
    izquierdaSidebar1, sidebar5Abierto, cerrarSidebar5, sidebar5Ancho,
    sidebar3Abierto, cerrarSidebar3, abrirNuevoRegistro, registroEnEdicionId, registroSeleccionadoId, setRegistroSeleccionadoId,
  } = useUI();
  const { PLANTEL, KARDEX, ESTUDIANTES } = useRegistros();
  const matricula = ESTUDIANTES.find((e) => e.id === registroSeleccionadoId)?.matricula;
  const izquierdaSidebar2 = izquierdaSidebar1 + ANCHO_SIDEBAR1;
  const izquierdaSidebar3 = sidebar3Abierto ? izquierdaSidebar2 : izquierdaSidebar2 + ANCHO_SIDEBAR2;
  const panelIzquierda = sidebar3Abierto ? izquierdaSidebar2 + ANCHO_SIDEBAR3 : izquierdaSidebar2 + ANCHO_SIDEBAR2;

  return (
    <>
      <Topbar />
      <Sidebar1 izquierda={izquierdaSidebar1} arriba={ALTO_TOPBAR} titulo={PLANTEL?.nombre ?? 'SIGESED'} subtitulo={PLANTEL?.institucion || 'Sistema Integral de Gestión Educativa'}>
        <MenuPrincipal />
      </Sidebar1>
      <Sidebar2
        abierto={!sidebar3Abierto}
        izquierda={izquierdaSidebar2}
        arriba={ALTO_TOPBAR}
        mostrarCerrar={false}
        badge="Kárdex académico"
        subtitulo={`${KARDEX.length} con calificaciones`}
        accionesHeader={<FiltroEstado />}
      >
        <ListaEstudiantesSidebar onAgregar={(id) => { setRegistroSeleccionadoId(id); abrirNuevoRegistro(); }} />
      </Sidebar2>
      <Sidebar3
        abierto={sidebar3Abierto}
        izquierda={izquierdaSidebar3}
        arriba={ALTO_TOPBAR}
        badge={registroEnEdicionId ? 'Editar calificación' : 'Captura del kárdex'}
        titulo={matricula && <BadgeDinamico texto={matricula} icono="ri-id-card-line" tono="gris" title="Matrícula" />}
        onCerrar={cerrarSidebar3}
      >
        <FormularioKardex />
      </Sidebar3>
      <Sidebar5 debajoTitulo={<RolesSesion />} abierto={sidebar5Abierto} ancho={sidebar5Ancho} arriba={ALTO_TOPBAR} onCerrar={cerrarSidebar5}>
        <MenuPanelControl />
      </Sidebar5>
      <PanelPrincipal izquierda={panelIzquierda} arriba={ALTO_TOPBAR}>
        <KardexEstudiante />
      </PanelPrincipal>
    </>
  );
}
