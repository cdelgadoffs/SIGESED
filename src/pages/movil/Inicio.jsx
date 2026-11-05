import MarcoMovil from '../../components/base/MarcoMovil.jsx';
import NavegacionMovil from '../../components/widgets/NavegacionMovil.jsx';
import MenuMovil from '../../components/widgets/MenuMovil.jsx';
import EscanerMovil from '../../components/widgets/EscanerMovil.jsx';
import InicioMovil from '../../components/widgets/InicioMovil.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';

export default function Inicio() {
  const { PLANTEL } = useRegistros();
  return (
    <MarcoMovil
      titulo={PLANTEL?.nombre || 'SIGESED'}
      subtitulo={PLANTEL?.institucion || 'Sistema Integral de Gestión Educativa'}
      accion={<MenuMovil />}
      navegacion={<NavegacionMovil />}
      flotante={<EscanerMovil />}
    >
      <InicioMovil />
    </MarcoMovil>
  );
}
