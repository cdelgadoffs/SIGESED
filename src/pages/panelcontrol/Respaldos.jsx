import { useRef, useState } from 'react';
import BotonS from '../../components/base/BotonS.jsx';
import Modal from '../../components/base/Modal.jsx';
import { useRespaldos } from '../../context/RespaldosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import '../../styles/pages/panelcontrol/Respaldos.css';

function fechaHora(iso) {
  return iso ? new Date(iso).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' }) : '';
}

export default function Respaldos() {
  const {
    carpetaSoportada, carpetaVinculada, conPermiso, ultimoRespaldo, errorAutomatico,
    vincularCarpeta, permitirAcceso, desvincularCarpeta, respaldarAhora, restaurarRespaldo,
  } = useRespaldos();
  const { setPanelControlActivo } = useUI();
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [porRestaurar, setPorRestaurar] = useState(null);
  const [errorRestaurar, setErrorRestaurar] = useState(null);
  const archivoRef = useRef(null);

  async function ejecutar(operacion, exito) {
    setOcupado(true);
    setError(null);
    setMensaje(null);
    try {
      await operacion();
      if (exito) setMensaje(exito);
    } catch (e) {
      if (e?.codigo !== 'CANCELADO') setError(e?.mensaje ?? 'No se pudo completar la operación.');
    } finally {
      setOcupado(false);
    }
  }

  async function leerArchivo(e) {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    setError(null);
    setMensaje(null);
    try {
      const respaldo = JSON.parse(await archivo.text());
      setPorRestaurar({ nombre: archivo.name, respaldo });
      setErrorRestaurar(null);
    } catch {
      setError('El archivo no es un JSON válido.');
    }
  }

  async function confirmarRestauracion() {
    setOcupado(true);
    setErrorRestaurar(null);
    try {
      await restaurarRespaldo(porRestaurar.respaldo);
      setPorRestaurar(null);
      setMensaje(`Se restauró el respaldo «${porRestaurar.nombre}».`);
    } catch (e) {
      setErrorRestaurar(e?.mensaje ?? 'No se pudo restaurar el respaldo.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="panelcontrol-respaldos">
      <div className="panelcontrol-respaldos-volver">
        <BotonS onClick={() => setPanelControlActivo(null)}>Volver</BotonS>
      </div>

      <section className="panelcontrol-respaldos-seccion">
        <h3><i className="ri-folder-shield-2-line" /> Carpeta de respaldos</h3>
        {!carpetaSoportada ? (
          <p className="panelcontrol-respaldos-nota">Este navegador no permite vincular carpetas. Usa Chrome o Edge de escritorio.</p>
        ) : carpetaVinculada ? (
          <>
            <p className="panelcontrol-respaldos-estado">
              <i className={conPermiso ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill'} />
              {` ${carpetaVinculada.nombre}`}
            </p>
            <p className="panelcontrol-respaldos-nota">
              {conPermiso
                ? 'Se guarda un respaldo automático tras cada cambio (un archivo por día).'
                : 'El navegador necesita tu permiso para seguir guardando en esta carpeta.'}
            </p>
            {ultimoRespaldo && <p className="panelcontrol-respaldos-nota">{`Último respaldo: ${fechaHora(ultimoRespaldo)}`}</p>}
            {errorAutomatico && <p className="panelcontrol-respaldos-error">{errorAutomatico}</p>}
            <div className="panelcontrol-respaldos-acciones">
              {conPermiso ? (
                <BotonS disabled={ocupado} onClick={() => ejecutar(respaldarAhora, 'Respaldo guardado.')}>Respaldar ahora</BotonS>
              ) : (
                <BotonS disabled={ocupado} onClick={() => ejecutar(permitirAcceso, 'Acceso concedido. Respaldo guardado.')}>Permitir acceso</BotonS>
              )}
              <BotonS disabled={ocupado} onClick={() => ejecutar(desvincularCarpeta, 'Carpeta desvinculada.')}>Desvincular</BotonS>
            </div>
          </>
        ) : (
          <>
            <p className="panelcontrol-respaldos-nota">Elige una carpeta de tu computadora (por ejemplo, de OneDrive) para guardar ahí respaldos automáticos.</p>
            <div className="panelcontrol-respaldos-acciones">
              <BotonS disabled={ocupado} onClick={() => ejecutar(vincularCarpeta, 'Carpeta vinculada. Se guardó el primer respaldo.')}>Vincular carpeta</BotonS>
            </div>
          </>
        )}
      </section>

      <section className="panelcontrol-respaldos-seccion">
        <h3><i className="ri-history-line" /> Restaurar respaldo</h3>
        <p className="panelcontrol-respaldos-nota">
          {carpetaVinculada
            ? 'Desvincula la carpeta para poder restaurar: así el respaldo automático no se mezcla con lo que restauras.'
            : 'Reemplaza todos los datos actuales por los de un archivo de respaldo (.json).'}
        </p>
        <div className="panelcontrol-respaldos-acciones">
          <BotonS disabled={ocupado || !!carpetaVinculada} onClick={() => archivoRef.current?.click()}>Elegir archivo…</BotonS>
        </div>
        <input ref={archivoRef} type="file" accept=".json,application/json" hidden onChange={leerArchivo} />
      </section>

      {mensaje && <p className="panelcontrol-respaldos-mensaje">{mensaje}</p>}
      {error && <p className="panelcontrol-respaldos-error">{error}</p>}

      <Modal abierto={!!porRestaurar} titulo="Restaurar respaldo" onCerrar={() => setPorRestaurar(null)}>
        <p className="panelcontrol-respaldos-modal-texto">
          {`¿Restaurar «${porRestaurar?.nombre ?? ''}»${porRestaurar?.respaldo?.generadoEn ? ` del ${fechaHora(porRestaurar.respaldo.generadoEn)}` : ''}? Se reemplazarán todos los datos actuales. Esta acción no se puede deshacer.`}
        </p>
        {errorRestaurar && <p className="panelcontrol-respaldos-modal-error">{errorRestaurar}</p>}
        <div className="panelcontrol-respaldos-modal-acciones">
          <BotonS variant="claro" onClick={() => setPorRestaurar(null)}>Cancelar</BotonS>
          <BotonS variant="claro" disabled={ocupado} onClick={confirmarRestauracion}>Restaurar</BotonS>
        </div>
      </Modal>
    </div>
  );
}
