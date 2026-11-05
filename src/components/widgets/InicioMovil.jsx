import { useState } from 'react';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useAjustesVisuales } from '../../context/AjustesVisualesContext.jsx';
import { esAdministradorTI, moduloDeVista } from '../../utils/permisos.js';
import { MODULOS_SOLO_ESCRITORIO, SECCIONES_MOVIL } from '../../utils/movil.js';
import { ESTADOS_CICLO } from '../../utils/fechas.js';
import '../../styles/widgets/InicioMovil.css';

const ESCRITORIO = 'accion:escritorio';

function enIPhoneSinInstalar() {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const instalada = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  return ios && !instalada;
}

export default function InicioMovil() {
  const { cuentaActiva, puede, rolesSesion, rolActivo } = useAuth();
  const { cambiarAjuste } = useAjustesVisuales();
  const { CICLOS, cicloActivoId } = useRegistros();
  const { setVistaActual } = useUI();
  const [avisoInstalar, setAvisoInstalar] = useState(enIPhoneSinInstalar);
  const ciclo = CICLOS.find((c) => c.id === cicloActivoId);
  const estado = ciclo ? ESTADOS_CICLO[ciclo.estado] : null;
  const accesos = [...SECCIONES_MOVIL, ...MODULOS_SOLO_ESCRITORIO].filter((s) => !s.siempre && puede(moduloDeVista(s.id)));
  if (esAdministradorTI(rolesSesion.filter(rolActivo))) {
    accesos.push({ id: ESCRITORIO, etiqueta: 'Panel de control', detalle: 'Disponible en la versión de escritorio', icono: 'ri-settings-3-line', escritorio: true });
  }

  function abrir(acceso) {
    if (acceso.escritorio) cambiarAjuste('vistaSistema', 'escritorio');
    if (acceso.id !== ESCRITORIO) setVistaActual(acceso.id);
  }
  const nombre = (cuentaActiva?.nombre ?? '').split(' ')[0];

  return (
    <div className="widget-inicio-movil">
      <section className="widget-inicio-movil-saludo">
        <span className="widget-inicio-movil-hola">{nombre ? `Hola, ${nombre}` : 'Hola'}</span>
        {ciclo && (
          <div className="widget-inicio-movil-ciclo">
            <span>{`Ciclo escolar ${ciclo.id}`}</span>
            {estado && <BadgeDinamico texto={ciclo.cerrado ? 'Cerrado' : estado.texto} tono="azul" />}
            {ciclo.semanaActual && <span className="widget-inicio-movil-semana">{ciclo.semanaActual.nombre}</span>}
          </div>
        )}
      </section>

      {avisoInstalar && (
        <section className="widget-inicio-movil-instalar">
          <i className="ri-smartphone-line" aria-hidden="true" />
          <p>
            Instala SIGESED en tu iPhone: toca <strong>Compartir</strong> <i className="ri-share-box-line" aria-hidden="true" /> y luego <strong>Agregar a pantalla de inicio</strong>.
          </p>
          <button type="button" aria-label="Cerrar aviso" onClick={() => setAvisoInstalar(false)}>
            <i className="ri-close-line" aria-hidden="true" />
          </button>
        </section>
      )}

      <div className="widget-inicio-movil-accesos">
        {accesos.map((a) => (
          <button key={a.id} type="button" className={`widget-inicio-movil-acceso${a.escritorio ? ' widget-inicio-movil-acceso-escritorio' : ''}`} onClick={() => abrir(a)}>
            <i className={a.icono} aria-hidden="true" />
            <span className="widget-inicio-movil-acceso-textos">
              <span className="widget-inicio-movil-acceso-titulo">{a.etiqueta}</span>
              <span className="widget-inicio-movil-acceso-detalle">{a.detalle}</span>
            </span>
            <i className={`${a.escritorio ? 'ri-computer-line' : 'ri-arrow-right-s-line'} widget-inicio-movil-acceso-flecha`} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
