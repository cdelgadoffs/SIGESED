import BadgeDinamico from '../base/BadgeDinamico.jsx';
import { useUI } from '../../context/UIContext.jsx';

const FILTROS = {
  activos: { texto: 'Activos', icono: 'ri-checkbox-circle-line', tono: 'verde', siguiente: 'inactivos' },
  inactivos: { texto: 'Inactivos', icono: 'ri-close-circle-line', tono: 'rojo', siguiente: 'activos' },
};

export default function FiltroEstado() {
  const { filtroEstado, setFiltroEstado, setRegistroSeleccionadoId } = useUI();
  const filtro = FILTROS[filtroEstado] ?? FILTROS.activos;
  return (
    <BadgeDinamico
      texto={filtro.texto}
      icono={filtro.icono}
      tono={filtro.tono}
      title="Cambiar filtro"
      onClick={() => {
        setFiltroEstado(filtro.siguiente);
        setRegistroSeleccionadoId(null);
      }}
    />
  );
}
