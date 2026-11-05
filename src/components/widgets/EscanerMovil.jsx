import { useState } from 'react';
import BotonFlotante from '../base/BotonFlotante.jsx';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import CamaraQR from './CamaraQR.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { nombreCompleto } from '../../utils/registros.js';
import '../../styles/widgets/EscanerMovil.css';

const ACCIONES_ESCANEO = [
  { id: 'kardex', tipo: 'estudiante', texto: 'Ver kárdex', icono: 'ri-file-user-line', vista: 'kardex', modulo: 'kardex', nivel: 'ver' },
  { id: 'reporte', tipo: 'estudiante', texto: 'Levantar reporte', icono: 'ri-draft-line', vista: 'bitacora', modulo: 'bitacora', nivel: 'editar', soloActivos: true },
];

export default function EscanerMovil() {
  const { puede } = useAuth();
  const { ESTUDIANTES, PERSONAL, GRUPOS } = useRegistros();
  const { setVistaActual, setRegistroSeleccionadoId } = useUI();
  const [abierto, setAbierto] = useState(false);
  const [leido, setLeido] = useState(null);

  const permitidas = ACCIONES_ESCANEO.filter((a) => puede(a.modulo, a.nivel));
  if (permitidas.length === 0) return null;

  function identificar(texto) {
    const codigo = texto.trim();
    const estudiante = ESTUDIANTES.find((e) => e.matricula === codigo.toUpperCase());
    if (estudiante) return { tipo: 'estudiante', registro: estudiante };
    const persona = PERSONAL.find((p) => p.id === codigo);
    if (persona) return { tipo: 'personal', registro: persona };
    return { tipo: null, codigo };
  }

  function cerrar() {
    setAbierto(false);
    setLeido(null);
  }

  function ejecutar(accion) {
    const id = leido.registro.id;
    cerrar();
    setVistaActual(accion.vista);
    setRegistroSeleccionadoId(id);
  }

  if (!abierto) return <BotonFlotante icono="ri-qr-scan-2-line" etiqueta="Escanear" onClick={() => setAbierto(true)} />;

  const acciones = leido?.tipo ? permitidas.filter((a) => a.tipo === leido.tipo && (!a.soloActivos || leido.registro.activo !== false)) : [];
  const grupo = leido?.tipo === 'estudiante' ? GRUPOS.find((g) => g.id === leido.registro.grupo) : null;

  return (
    <div className="widget-escaner-movil">
      <header className="widget-escaner-movil-encabezado">
        <span>Escanear código QR</span>
        <button type="button" aria-label="Cerrar" onClick={cerrar}>
          <i className="ri-close-line" aria-hidden="true" />
        </button>
      </header>
      {!leido ? (
        <>
          <CamaraQR onLeer={(texto) => setLeido(identificar(texto))} />
          <p className="widget-escaner-movil-ayuda">Apunta la cámara al código QR de la credencial.</p>
        </>
      ) : (
        <div className="widget-escaner-movil-resultado">
          {leido.tipo ? (
            <section className="widget-escaner-movil-tarjeta">
              <span className="widget-escaner-movil-nombre">{nombreCompleto(leido.registro)}</span>
              <div className="widget-escaner-movil-insignias">
                <BadgeDinamico texto={leido.tipo === 'estudiante' ? 'Estudiante' : 'Personal'} tono="azul" />
                {leido.registro.matricula && <BadgeDinamico texto={leido.registro.matricula} icono="ri-id-card-line" tono="gris" />}
                {grupo && <BadgeDinamico texto={grupo.nombre} tono="gris" />}
                <BadgeDinamico texto={leido.registro.activo === false ? 'Inactivo' : 'Activo'} tono={leido.registro.activo === false ? 'rojo' : 'verde'} />
              </div>
              {acciones.length === 0 && <p className="widget-escaner-movil-mensaje">No hay acciones disponibles para este código.</p>}
              <div className="widget-escaner-movil-acciones">
                {acciones.map((a) => (
                  <button key={a.id} type="button" className="widget-escaner-movil-accion" onClick={() => ejecutar(a)}>
                    <i className={a.icono} aria-hidden="true" />
                    <span>{a.texto}</span>
                    <i className="ri-arrow-right-s-line" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="widget-escaner-movil-tarjeta">
              <span className="widget-escaner-movil-nombre">Código no reconocido</span>
              <p className="widget-escaner-movil-mensaje">El código no corresponde a ningún estudiante ni persona registrada.</p>
            </section>
          )}
          <button type="button" className="widget-escaner-movil-otro" onClick={() => setLeido(null)}>
            <i className="ri-qr-scan-2-line" aria-hidden="true" /> Escanear otro
          </button>
        </div>
      )}
    </div>
  );
}
