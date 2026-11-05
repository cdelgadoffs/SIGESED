import { lazy, Suspense, useEffect } from 'react';
import Skeleton from './components/Skeleton.jsx';
import Sidebar4 from './components/base/Sidebar4.jsx';
import AtenuadorPantalla from './components/widgets/AtenuadorPantalla.jsx';
import InicioPublico from './pages/publico/Inicio.jsx';
import Nosotros from './pages/publico/Nosotros.jsx';
import Oferta from './pages/publico/Oferta.jsx';
import Avisos from './pages/publico/Avisos.jsx';
import Galeria from './pages/publico/Galeria.jsx';
import Admisiones from './pages/publico/Admisiones.jsx';
import { useUI } from './context/UIContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { useAjustesVisuales } from './context/AjustesVisualesContext.jsx';
import { moduloDeVista, primeraVistaPermitida } from './utils/permisos.js';

const PAGES_PUBLICAS = {
  'publico:inicio': InicioPublico,
  'publico:nosotros': Nosotros,
  'publico:oferta': Oferta,
  'publico:avisos': Avisos,
  'publico:galeria': Galeria,
  'publico:admisiones': Admisiones,
};

const PAGES = {
  inicio: lazy(() => import('./pages/Inicio.jsx')),
  grupos: lazy(() => import('./pages/Grupos.jsx')),
  personal: lazy(() => import('./pages/Personal.jsx')),
  estudiantes: lazy(() => import('./pages/Estudiantes.jsx')),
  evaluaciones: lazy(() => import('./pages/Evaluaciones.jsx')),
  planEstudios: lazy(() => import('./pages/PlanEstudios.jsx')),
  kardex: lazy(() => import('./pages/Kardex.jsx')),
  horarios: lazy(() => import('./pages/ControlHorarios.jsx')),
  asistencia: lazy(() => import('./pages/AsistenciaGeneral.jsx')),
  planTrabajo: lazy(() => import('./pages/PlanTrabajo.jsx')),
  cursos: lazy(() => import('./pages/CursosExtracurriculares.jsx')),
  bitacora: lazy(() => import('./pages/BitacoraEstudiantil.jsx')),
};

const PAGES_MOVIL = {
  inicio: lazy(() => import('./pages/movil/Inicio.jsx')),
  horarios: lazy(() => import('./pages/movil/Horario.jsx')),
  bitacora: lazy(() => import('./pages/movil/Bitacora.jsx')),
};

const NoDisponibleMovil = lazy(() => import('./pages/movil/NoDisponible.jsx'));

function App() {
  const { vistaActual, setVistaActual, sidebar4Abierto, setSidebar4Abierto, pantallaAngosta } = useUI();
  const { vistaSistema } = useAjustesVisuales();
  const movil = vistaSistema === 'movil' || (vistaSistema === 'auto' && pantallaAngosta);
  const { cuentaActiva, cargandoSesion, puede } = useAuth();
  const Publica = PAGES_PUBLICAS[vistaActual];
  const Page = PAGES[vistaActual];
  const sinAcceso = !Publica && !cuentaActiva;

  useEffect(() => {
    if (sinAcceso && !cargandoSesion) {
      setVistaActual('publico:inicio');
    }
  }, [sinAcceso, cargandoSesion]);

  const vistaPermitida = !Page || !cuentaActiva || (movil && vistaActual === 'inicio') || puede(moduloDeVista(vistaActual));
  const alternativa = vistaPermitida ? null : primeraVistaPermitida(puede);

  useEffect(() => {
    if (alternativa) setVistaActual(alternativa);
  }, [alternativa]);

  if (sinAcceso) return <Skeleton />;

  if (Publica) {
    return (
      <Skeleton>
        <Publica />
      </Skeleton>
    );
  }

  if (movil) {
    const PageMovil = PAGES_MOVIL[vistaActual] ?? (Page ? NoDisponibleMovil : null);
    return (
      <>
        <Skeleton>
          <Suspense fallback={null}>
            {PageMovil && <PageMovil />}
          </Suspense>
        </Skeleton>
        <AtenuadorPantalla />
      </>
    );
  }

  return (
    <>
      <Skeleton>
        <Suspense fallback={null}>
          {Page && <Page />}
        </Suspense>
      </Skeleton>
      <Sidebar4 abierto={sidebar4Abierto} onCerrar={() => setSidebar4Abierto(false)} />
      <AtenuadorPantalla />
    </>
  );
}

export default App;
