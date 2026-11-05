import MarcoMovil from '../../components/base/MarcoMovil.jsx';
import NavegacionMovil from '../../components/widgets/NavegacionMovil.jsx';
import MenuMovil from '../../components/widgets/MenuMovil.jsx';
import EscanerMovil from '../../components/widgets/EscanerMovil.jsx';
import HorarioMovil from '../../components/widgets/HorarioMovil.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';

export default function Horario() {
  const { cicloActivoId } = useRegistros();
  return (
    <MarcoMovil
      titulo="Horario"
      subtitulo={cicloActivoId ? `Ciclo escolar ${cicloActivoId}` : ''}
      accion={<MenuMovil />}
      navegacion={<NavegacionMovil />}
      flotante={<EscanerMovil />}
    >
      <HorarioMovil />
    </MarcoMovil>
  );
}
