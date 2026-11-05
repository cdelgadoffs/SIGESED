import MarcoMovil from '../../components/base/MarcoMovil.jsx';
import NavegacionMovil from '../../components/widgets/NavegacionMovil.jsx';
import MenuMovil from '../../components/widgets/MenuMovil.jsx';
import EscanerMovil from '../../components/widgets/EscanerMovil.jsx';
import EvaluacionesMovil from '../../components/widgets/EvaluacionesMovil.jsx';

export default function Evaluaciones() {
  return (
    <MarcoMovil
      titulo="Registro de evaluaciones"
      subtitulo="Captura de calificaciones"
      accion={<MenuMovil />}
      navegacion={<NavegacionMovil />}
      flotante={<EscanerMovil />}
    >
      <EvaluacionesMovil />
    </MarcoMovil>
  );
}
