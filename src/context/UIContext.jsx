import { createContext, useContext, useState } from 'react';

export const ANCHO_SIDEBAR1 = 270;
export const ANCHO_SIDEBAR2 = 250;
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
  const [panelControlActivo, setPanelControlActivo] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [vistaActual, setVistaActualEstado] = useState('inicio');
  const [registroEnEdicionId, setRegistroEnEdicionId] = useState(null);
  const [registroSeleccionadoId, setRegistroSeleccionadoId] = useState(null);
  const [registrosAbierto, setRegistrosAbierto] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('activos');
  const [cicloEnEdicionId, setCicloEnEdicionId] = useState(null);
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
  function setVistaActual(vista) {
    setVistaActualEstado(vista);
    cerrarSidebar3();
    setRegistroSeleccionadoId(null);
    setFiltroEstado('activos');
    setCicloEnEdicionId(null);
  }

  const value = {
    sidebar3Abierto, cerrarSidebar3,
    registroEnEdicionId, abrirNuevoRegistro, abrirEdicionRegistro,
    registroSeleccionadoId, setRegistroSeleccionadoId,
    registrosAbierto, setRegistrosAbierto,
    filtroEstado, setFiltroEstado,
    cicloEnEdicionId, setCicloEnEdicionId,
    sidebar4Abierto, setSidebar4Abierto,
    sidebar5Abierto, toggleSidebar5, cerrarSidebar5,
    sidebar5Ancho, setSidebar5Ancho,
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
