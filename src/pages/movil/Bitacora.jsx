import MarcoMovil from '../../components/base/MarcoMovil.jsx';
import NavegacionMovil from '../../components/widgets/NavegacionMovil.jsx';
import OpcionesCuentaMovil from '../../components/widgets/OpcionesCuentaMovil.jsx';
import BitacoraMovil from '../../components/widgets/BitacoraMovil.jsx';

export default function Bitacora() {
  return (
    <MarcoMovil
      titulo="Bitácora estudiantil"
      subtitulo="Reportes disciplinarios"
      accion={<OpcionesCuentaMovil />}
      navegacion={<NavegacionMovil />}
    >
      <BitacoraMovil />
    </MarcoMovil>
  );
}
