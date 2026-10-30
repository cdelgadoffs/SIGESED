import Skeleton from './components/Skeleton.jsx';
import Sidebar4 from './components/base/Sidebar4.jsx';
import AtenuadorPantalla from './components/widgets/AtenuadorPantalla.jsx';
import Inicio from './pages/Inicio.jsx';
import Grupos from './pages/Grupos.jsx';
import Personal from './pages/Personal.jsx';
import Estudiantes from './pages/Estudiantes.jsx';
import Evaluaciones from './pages/Evaluaciones.jsx';
import PlanEstudios from './pages/PlanEstudios.jsx';
import Kardex from './pages/Kardex.jsx';
import BitacoraEstudiantil from './pages/BitacoraEstudiantil.jsx';
import { useUI } from './context/UIContext.jsx';

const PAGES = {
  inicio: Inicio,
  grupos: Grupos,
  personal: Personal,
  estudiantes: Estudiantes,
  evaluaciones: Evaluaciones,
  planEstudios: PlanEstudios,
  kardex: Kardex,
  bitacora: BitacoraEstudiantil,
};

function App() {
  const { vistaActual, sidebar4Abierto, setSidebar4Abierto } = useUI();
  const Page = PAGES[vistaActual];

  return (
    <>
      <Skeleton>
        {Page && <Page />}
      </Skeleton>
      <Sidebar4 abierto={sidebar4Abierto} onCerrar={() => setSidebar4Abierto(false)} />
      <AtenuadorPantalla />
    </>
  );
}

export default App;
