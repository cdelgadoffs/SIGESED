import Topbar from '../components/widgets/Topbar.jsx';
import CintaCiclos from '../components/widgets/CintaCiclos.jsx';
import Sidebar1 from '../components/base/Sidebar1.jsx';
import Sidebar5 from '../components/base/Sidebar5.jsx';
import PanelPrincipal from '../components/base/PanelPrincipal.jsx';
import MenuPrincipal from '../components/widgets/MenuPrincipal.jsx';
import MenuPanelControl from '../components/widgets/MenuPanelControl.jsx';
import RolesSesion from '../components/widgets/RolesSesion.jsx';
import CalendarioSemanal from '../components/widgets/CalendarioSemanal.jsx';
import ResumenCiclo from '../components/widgets/ResumenCiclo.jsx';
import Sidebar4 from '../components/base/Sidebar4.jsx';
import FormularioCiclo from '../components/widgets/FormularioCiclo.jsx';
import PreparacionCiclo from '../components/widgets/PreparacionCiclo.jsx';
import FormularioInscripcion from '../components/widgets/FormularioInscripcion.jsx';
import Sidebar3 from '../components/base/Sidebar3.jsx';
import { useRegistros } from '../context/RegistrosContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI, ANCHO_SIDEBAR1, ANCHO_SIDEBAR3, ANCHO_SIDEBAR4, ALTO_TOPBAR, ALTO_CINTA } from '../context/UIContext.jsx';

export default function Inicio() {
  const {
    izquierdaSidebar1, sidebar5Abierto, cerrarSidebar5, sidebar5Ancho,
    cicloEnEdicionId, setCicloEnEdicionId, grupoEnInscripcionId, setGrupoEnInscripcionId,
  } = useUI();
  const puedeEditar = useAuth().puede('inicio', 'editar');
  const { PLANTEL, CICLOS, GRUPOS, cicloActivoId } = useRegistros();
  const ciclo = CICLOS.find((c) => c.id === cicloActivoId);
  const enPreparacion = !!ciclo && !ciclo.iniciado && !ciclo.cerrado;
  const grupoInscrito = enPreparacion ? GRUPOS.find((g) => g.id === grupoEnInscripcionId) : null;
  const editando = !!cicloActivoId && cicloEnEdicionId === cicloActivoId;
  const formularioAbierto = puedeEditar && (!!grupoInscrito || ciclo?.estado === 'sin-configurar' || editando);
  let badge = `Configurar ciclo ${cicloActivoId ?? ''}`;
  if (grupoInscrito) badge = `Inscripción de ${grupoInscrito.nombre} · ${cicloActivoId}`;
  else if (editando) badge = `Editar ciclo ${cicloActivoId}`;
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
        badge={badge}
        mostrarCerrar={!!grupoInscrito || editando}
        onCerrar={() => (grupoInscrito ? setGrupoEnInscripcionId(null) : setCicloEnEdicionId(null))}
      >
        {grupoInscrito ? <FormularioInscripcion /> : <FormularioCiclo />}
      </Sidebar3>
      <Sidebar4 abierto={!!ciclo && !grupoInscrito} mostrarCerrar={false} titulo={`Calendario ${cicloActivoId ?? ''}`} arriba={arriba}>
        <CalendarioSemanal />
      </Sidebar4>
      <PanelPrincipal izquierda={izquierdaSidebar3 + (formularioAbierto ? ANCHO_SIDEBAR3 : 0)} derecha={ciclo && !grupoInscrito ? ANCHO_SIDEBAR4 : 0} arriba={arriba}>
        {enPreparacion ? <PreparacionCiclo /> : <ResumenCiclo />}
      </PanelPrincipal>
    </>
  );
}
