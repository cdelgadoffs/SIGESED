import MarcoMovil from '../../components/base/MarcoMovil.jsx';
import NavegacionMovil from '../../components/widgets/NavegacionMovil.jsx';
import MenuMovil from '../../components/widgets/MenuMovil.jsx';
import EscanerMovil from '../../components/widgets/EscanerMovil.jsx';
import KardexMovil from '../../components/widgets/KardexMovil.jsx';

export default function Kardex() {
  return (
    <MarcoMovil
      titulo="Kárdex académico"
      subtitulo="Consulta de calificaciones"
      accion={<MenuMovil />}
      navegacion={<NavegacionMovil />}
      flotante={<EscanerMovil />}
    >
      <KardexMovil />
    </MarcoMovil>
  );
}
