import { useEffect, useRef } from 'react';
import NavegacionPublica from '../base/NavegacionPublica.jsx';
import BotonS from '../base/BotonS.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../../assets/Icom.jpg';
import '../../styles/widgets/NavegacionSitio.css';

const DURACION_AVISO = 4000;

const ENLACES_SITIO = [
  { id: 'publico:inicio', texto: 'Inicio' },
  { id: 'publico:nosotros', texto: 'Nosotros' },
  { id: 'publico:oferta', texto: 'Oferta educativa' },
  { id: 'publico:avisos', texto: 'Avisos' },
  { id: 'publico:galeria', texto: 'Galería' },
  { id: 'publico:admisiones', texto: 'Admisiones' },
];

export default function NavegacionSitio() {
  const { PLANTEL } = useRegistros();
  const { vistaActual, setVistaActual } = useUI();
  const {
    cuentaActiva, cargandoSesion, prepararAccesoGoogle, errorAcceso, sesionCerrada, descartarAvisoSesion,
  } = useAuth();
  const botonGoogle = useRef(null);
  const esperandoAcceso = useRef(false);
  const mostrarGoogle = !cuentaActiva && !cargandoSesion;

  useEffect(() => {
    if (mostrarGoogle && botonGoogle.current) prepararAccesoGoogle(botonGoogle.current);
  }, [mostrarGoogle]);

  useEffect(() => {
    if (!sesionCerrada) return undefined;
    const temporizador = setTimeout(descartarAvisoSesion, DURACION_AVISO);
    return () => clearTimeout(temporizador);
  }, [sesionCerrada]);

  useEffect(() => {
    if (mostrarGoogle) esperandoAcceso.current = true;
    else if (cuentaActiva && esperandoAcceso.current) {
      esperandoAcceso.current = false;
      setVistaActual('inicio');
    }
  }, [mostrarGoogle, cuentaActiva]);

  return (
    <NavegacionPublica
      logo={logo}
      nombre={PLANTEL?.institucion || 'Instituto'}
      subtitulo={PLANTEL?.nombre}
      enlaces={ENLACES_SITIO}
      activo={vistaActual}
      onNavegar={setVistaActual}
      accion={(
        <span className="widget-navegacion-sitio-acceso">
          {cuentaActiva ? (
            <BotonS onClick={() => setVistaActual('inicio')}>
              Ir al sistema
            </BotonS>
          ) : mostrarGoogle && (
            <>
              <span ref={botonGoogle} className="widget-navegacion-sitio-google" />
              {errorAcceso && <span className="widget-navegacion-sitio-error">{errorAcceso}</span>}
              {sesionCerrada && (
                <span className="widget-navegacion-sitio-aviso" role="status">
                  <i className="ri-checkbox-circle-fill" />
                  {' Cerraste tu sesión correctamente.'}
                </span>
              )}
            </>
          )}
        </span>
      )}
    />
  );
}
