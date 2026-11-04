import PaginaSitio from '../../components/base/PaginaSitio.jsx';
import NavegacionSitio from '../../components/widgets/NavegacionSitio.jsx';
import PieSitio from '../../components/widgets/PieSitio.jsx';
import BloquesSitio from '../../components/widgets/BloquesSitio.jsx';

export default function Galeria() {
  return (
    <PaginaSitio navegacion={<NavegacionSitio />} pie={<PieSitio />}>
      <BloquesSitio pagina="publico:galeria" />
    </PaginaSitio>
  );
}
