import { useEffect, useState } from 'react';
import BotonS from '../../components/base/BotonS.jsx';
import CardS from '../../components/base/CardS.jsx';
import Modal from '../../components/base/Modal.jsx';
import OpcionesNavegacion from '../../components/widgets/OpcionesNavegacion.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { ESTADOS_CICLO } from '../../utils/fechas.js';
import '../../styles/pages/panelcontrol/CalendarizacionAnual.css';

const CICLOS_POR_ANIO = 6;

export default function CalendarizacionAnual() {
  const { CICLOS, cicloActivoId, seleccionarCiclo, crearCiclosAnuales, concluirCiclo, CARGA } = useRegistros();
  const [porConcluir, setPorConcluir] = useState(null);
  const [errorCierre, setErrorCierre] = useState(null);
  const [cerrando, setCerrando] = useState(false);
  const { setPanelControlActivo, setSidebar5Ancho, setVistaActual, setCicloEnEdicionId, cerrarSidebar5 } = useUI();
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    setSidebar5Ancho(true);
    return () => setSidebar5Ancho(false);
  }, [setSidebar5Ancho]);

  const delAnio = CICLOS.filter((c) => c.anio === anio);
  const completa = delAnio.length >= CICLOS_POR_ANIO;

  function cambiarAnio(delta) {
    setAnio((a) => a + delta);
    setMensaje(null);
  }

  function editar(id) {
    seleccionarCiclo(id);
    setVistaActual('inicio');
    setCicloEnEdicionId(id);
    cerrarSidebar5();
  }

  function cerrarModal() {
    setPorConcluir(null);
    setErrorCierre(null);
  }

  async function confirmarCierre() {
    setCerrando(true);
    setErrorCierre(null);
    try {
      await concluirCiclo(porConcluir);
      setPorConcluir(null);
    } catch (e) {
      setErrorCierre(e?.mensaje ?? 'No se pudo concluir el ciclo.');
    } finally {
      setCerrando(false);
    }
  }

  async function crear() {
    setEnviando(true);
    setMensaje(null);
    try {
      await crearCiclosAnuales(anio);
      setMensaje({ ok: true, texto: `Se creó la calendarización ${anio}.` });
    } catch (e) {
      setMensaje({ ok: false, texto: e?.mensaje ?? 'No se pudo crear la calendarización.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="panelcontrol-calendarizacion-anual">
      <div className="panelcontrol-calendarizacion-anual-volver">
        <BotonS onClick={() => setPanelControlActivo(null)}>Volver</BotonS>
      </div>
      <div className="panelcontrol-calendarizacion-anual-anio">
        <OpcionesNavegacion
          onAnterior={() => cambiarAnio(-1)}
          onSiguiente={() => cambiarAnio(1)}
          etiquetaAnterior="Año anterior"
          etiquetaSiguiente="Año siguiente"
        />
        <span className="panelcontrol-calendarizacion-anual-anio-texto">{anio}</span>
      </div>
      {completa ? (
        !mensaje && <p className="panelcontrol-calendarizacion-anual-nota">La calendarización {anio} ya está creada.</p>
      ) : (
        <BotonS onClick={crear} disabled={enviando}>Crear calendarización anual de ciclos escolares</BotonS>
      )}
      {mensaje && (
        <p className={'panelcontrol-calendarizacion-anual-nota' + (mensaje.ok ? '' : ' panelcontrol-calendarizacion-anual-error')}>
          {mensaje.texto}
        </p>
      )}
      {CARGA.ciclos.error && (
        <p className="panelcontrol-calendarizacion-anual-nota panelcontrol-calendarizacion-anual-error">
          No se pudieron cargar los ciclos: {CARGA.ciclos.error.mensaje}
        </p>
      )}
      <div className="panelcontrol-calendarizacion-anual-lista">
        {delAnio.map((c) => {
          const estado = ESTADOS_CICLO[c.estado] ?? ESTADOS_CICLO['sin-configurar'];
          return (
            <CardS
              key={c.id}
              estado={estado.cinta}
              titulo={`Ciclo ${c.id}${c.id === cicloActivoId ? ' · activo' : ''}`}
              subtitulo={c.fechaInicio ? `${c.fechaInicio} a ${c.fechaFin}` : `${c.duracionMeses} meses`}
              estadoLabel={c.cerrado ? 'Cerrado' : estado.texto}
              accion={c.fechaInicio && !c.cerrado
                ? <BotonS variant="claro" onClick={() => setPorConcluir(c.id)}>Concluir ciclo escolar</BotonS>
                : undefined}
              onClick={() => seleccionarCiclo(c.id)}
              onEditar={c.cerrado ? undefined : () => editar(c.id)}
            />
          );
        })}
      </div>
      <Modal abierto={porConcluir !== null} titulo="Concluir ciclo escolar" onCerrar={cerrarModal}>
        <p className="panelcontrol-calendarizacion-anual-modal-texto">
          ¿Concluir el ciclo escolar {porConcluir}? Ya no podrá modificarse y se habilitará la configuración del siguiente ciclo.
        </p>
        {errorCierre && <p className="panelcontrol-calendarizacion-anual-modal-error">{errorCierre}</p>}
        <div className="panelcontrol-calendarizacion-anual-modal-acciones">
          <BotonS variant="claro" onClick={cerrarModal}>Cancelar</BotonS>
          <BotonS variant="claro" onClick={confirmarCierre} disabled={cerrando}>Concluir</BotonS>
        </div>
      </Modal>
    </div>
  );
}
