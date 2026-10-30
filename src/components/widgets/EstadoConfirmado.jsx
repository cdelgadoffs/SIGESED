import { useState } from 'react';
import Interruptor from '../base/Interruptor.jsx';
import BotonS from '../base/BotonS.jsx';
import Modal from '../base/Modal.jsx';
import '../../styles/widgets/EstadoConfirmado.css';

export default function EstadoConfirmado({ encendido, descripcion, onCambiar, tamano }) {
  const [pidiendo, setPidiendo] = useState(false);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const accion = encendido ? 'Desactivar' : 'Activar';

  function cerrar() {
    setPidiendo(false);
    setError(null);
  }

  async function confirmar() {
    setOcupado(true);
    setError(null);
    try {
      await onCambiar(!encendido);
      setPidiendo(false);
    } catch (e) {
      setError(e?.mensaje ?? 'No se pudo cambiar el estado.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <span className="widget-estado-confirmado" onClick={(e) => e.stopPropagation()}>
      <Interruptor
        encendido={encendido}
        tamano={tamano}
        textoEncendido="Activo"
        textoApagado="Inactivo"
        ariaLabel={encendido ? `Activo (clic para desactivar ${descripcion})` : `Inactivo (clic para activar ${descripcion})`}
        onCambiar={() => setPidiendo(true)}
      />
      <Modal abierto={pidiendo} titulo={`${accion} registro`} onCerrar={cerrar}>
        <p className="widget-estado-confirmado-mensaje">¿{accion} {descripcion}?</p>
        {error && <p className="widget-estado-confirmado-error">{error}</p>}
        <div className="widget-estado-confirmado-acciones">
          <BotonS variant="claro" onClick={cerrar}>Cancelar</BotonS>
          <BotonS variant="claro" onClick={confirmar} disabled={ocupado}>{accion}</BotonS>
        </div>
      </Modal>
    </span>
  );
}
