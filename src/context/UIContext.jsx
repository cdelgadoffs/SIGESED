import { createContext, useContext, useEffect, useState } from 'react';
import { PAGINAS_SITIO, esVistaPublica, vistaDeRuta } from '../utils/sitio.js';

const RUTA_SISTEMA = '/sistema';

function vistaDeUbicacion() {
  const ruta = window.location.pathname;
  if (ruta === RUTA_SISTEMA) return 'inicio';
  return vistaDeRuta(ruta) ?? 'publico:inicio';
}

export const ANCHO_SIDEBAR1 = 270;
export const ANCHO_SIDEBAR2 = 250;
export const ANCHO_SIDEBAR2_AMPLIO = 380;
export const ANCHO_SIDEBAR3 = 500;
export const ALTO_TOPBAR = 52;
export const ALTO_CINTA = 50;
export const ANCHO_SIDEBAR4 = 320;

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [sidebar3Abierto, setSidebar3Abierto] = useState(false);
  const [sidebar4Abierto, setSidebar4Abierto] = useState(false);
  const [sidebar5Abierto, setSidebar5Abierto] = useState(false);
  const [sidebar5Ancho, setSidebar5Ancho] = useState(false);
  const [sidebar2Amplio, setSidebar2Amplio] = useState(false);
  const [panelControlActivo, setPanelControlActivo] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [vistaActual, setVistaActualEstado] = useState(vistaDeUbicacion);
  const [registroEnEdicionId, setRegistroEnEdicionId] = useState(null);
  const [registroSeleccionadoId, setRegistroSeleccionadoId] = useState(null);
  const [registrosAbierto, setRegistrosAbierto] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('activos');
  const [programaPlanEstudios, setProgramaPlanEstudios] = useState(null);
  const [cicloEnEdicionId, setCicloEnEdicionId] = useState(null);
  const [grupoEnInscripcionId, setGrupoEnInscripcionId] = useState(null);
  const izquierdaSidebar1 = 0;
  const izquierdaSidebar3 = izquierdaSidebar1 + ANCHO_SIDEBAR1;

  function toggleSidebar5() {
    if (sidebar5Abierto) setPanelControlActivo(null);
    setSidebar5Abierto((a) => !a);
  }
  function cerrarSidebar5() {
    setSidebar5Abierto(false);
    setPanelControlActivo(null);
  }
  function abrirPanelControl(id) {
    setPanelControlActivo(id);
    setSidebar5Abierto(true);
  }
  function abrirNuevoRegistro() {
    setRegistroEnEdicionId(null);
    setSidebar3Abierto(true);
  }
  function abrirEdicionRegistro(id) {
    setRegistroEnEdicionId(id);
    setSidebar3Abierto(true);
  }
  function cerrarSidebar3() {
    setSidebar3Abierto(false);
    setRegistroEnEdicionId(null);
  }
  useEffect(() => {
    const alVolver = () => setVistaActualEstado(vistaDeUbicacion());
    window.addEventListener('popstate', alVolver);
    return () => window.removeEventListener('popstate', alVolver);
  }, []);

  function setVistaActual(vista) {
    const ruta = esVistaPublica(vista) ? PAGINAS_SITIO[vista].ruta : RUTA_SISTEMA;
    if (window.location.pathname !== ruta) window.history.pushState(null, '', ruta);
    setVistaActualEstado(vista);
    cerrarSidebar3();
    setRegistroSeleccionadoId(null);
    setFiltroEstado('activos');
    setCicloEnEdicionId(null);
    setGrupoEnInscripcionId(null);
  }

  const value = {
    sidebar3Abierto, cerrarSidebar3,
    registroEnEdicionId, abrirNuevoRegistro, abrirEdicionRegistro,
    registroSeleccionadoId, setRegistroSeleccionadoId,
    registrosAbierto, setRegistrosAbierto,
    filtroEstado, setFiltroEstado,
    programaPlanEstudios, setProgramaPlanEstudios,
    cicloEnEdicionId, setCicloEnEdicionId,
    grupoEnInscripcionId, setGrupoEnInscripcionId,
    sidebar4Abierto, setSidebar4Abierto,
    sidebar5Abierto, toggleSidebar5, cerrarSidebar5,
    sidebar5Ancho, setSidebar5Ancho,
    sidebar2Amplio, setSidebar2Amplio,
    panelControlActivo, setPanelControlActivo, abrirPanelControl,
    terminoBusqueda, setTerminoBusqueda,
    vistaActual, setVistaActual,
    izquierdaSidebar1, izquierdaSidebar3,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  return useContext(UIContext);
}
