import Skeleton from './components/Skeleton.jsx';
import Sidebar4 from './components/base/Sidebar4.jsx';
import AtenuadorPantalla from './components/widgets/AtenuadorPantalla.jsx';
import Inicio from './pages/Inicio.jsx';
import Personal from './pages/Personal.jsx';
import Estudiantes from './pages/Estudiantes.jsx';
import { useUI } from './context/UIContext.jsx';

const PAGES = {
  inicio: Inicio,
  personal: Personal,
  estudiantes: Estudiantes,
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
