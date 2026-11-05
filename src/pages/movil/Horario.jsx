import MarcoMovil from '../../components/base/MarcoMovil.jsx';
import NavegacionMovil from '../../components/widgets/NavegacionMovil.jsx';
import OpcionesCuentaMovil from '../../components/widgets/OpcionesCuentaMovil.jsx';
import HorarioMovil from '../../components/widgets/HorarioMovil.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';

export default function Horario() {
  const { cicloActivoId } = useRegistros();
  return (
    <MarcoMovil
      titulo="Horario"
      subtitulo={cicloActivoId ? `Ciclo escolar ${cicloActivoId}` : ''}
      accion={<OpcionesCuentaMovil />}
      navegacion={<NavegacionMovil />}
    >
      <HorarioMovil />
    </MarcoMovil>
  );
}
