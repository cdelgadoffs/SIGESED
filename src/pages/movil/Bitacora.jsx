import MarcoMovil from '../../components/base/MarcoMovil.jsx';
import NavegacionMovil from '../../components/widgets/NavegacionMovil.jsx';
import MenuMovil from '../../components/widgets/MenuMovil.jsx';
import EscanerMovil from '../../components/widgets/EscanerMovil.jsx';
import BitacoraMovil from '../../components/widgets/BitacoraMovil.jsx';

export default function Bitacora() {
  return (
    <MarcoMovil
      titulo="Bitácora estudiantil"
      subtitulo="Reportes disciplinarios"
      accion={<MenuMovil />}
      navegacion={<NavegacionMovil />}
      flotante={<EscanerMovil />}
    >
      <BitacoraMovil />
    </MarcoMovil>
  );
}
