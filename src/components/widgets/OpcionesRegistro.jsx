import { useState } from 'react';
import BotonIcono from '../base/BotonIcono.jsx';
import BotonS from '../base/BotonS.jsx';
import Modal from '../base/Modal.jsx';
import '../../styles/widgets/OpcionesRegistro.css';

export default function OpcionesRegistro({ descripcion, onEditar, onEliminar }) {
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  function cerrar() {
    setConfirmando(false);
    setError(null);
  }

  async function eliminar() {
    setOcupado(true);
    setError(null);
    try {
      await onEliminar();
      setConfirmando(false);
    } catch (e) {
      setError(e?.mensaje ?? 'No se pudo eliminar.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="widget-opciones-registro" onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
      <BotonIcono icono="ri-pencil-line" ariaLabel="Editar" onClick={onEditar} />
      <BotonIcono icono="ri-delete-bin-line" ariaLabel="Eliminar" onClick={() => setConfirmando(true)} />
      <Modal abierto={confirmando} titulo="Eliminar registro" onCerrar={cerrar}>
        <p className="widget-opciones-registro-mensaje">¿Eliminar {descripcion}? Esta acción no se puede deshacer.</p>
        {error && <p className="widget-opciones-registro-error">{error}</p>}
        <div className="widget-opciones-registro-modal-acciones">
          <BotonS variant="claro" onClick={cerrar}>Cancelar</BotonS>
          <BotonS variant="claro" onClick={eliminar} disabled={ocupado}>Eliminar</BotonS>
        </div>
      </Modal>
    </div>
  );
}
