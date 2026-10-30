import { useRef, useState } from 'react';
import Checkbox from '../base/Checkbox.jsx';
import CampoTexto from '../base/CampoTexto.jsx';
import BotonS from '../base/BotonS.jsx';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { nombreDeCatalogo } from '../../utils/registros.js';
import { cuatrimestresDe, documentoPlanEstudios, filtrarMaterias, nombreCuatrimestre } from '../../utils/planEstudios.js';
import { useScrollbarPersonalizada } from '../../hooks/useScrollbarPersonalizada.js';
import '../../styles/widgets/ResumenPlanEstudios.css';

export default function ResumenPlanEstudios() {
  const { MATERIAS, PROGRAMAS_EDUCATIVOS, PLANTEL } = useRegistros();
  const { setRegistroSeleccionadoId } = useUI();
  const [filtro, setFiltro] = useState('');
  const [elegidas, setElegidas] = useState(() => new Set());
  const [archivo, setArchivo] = useState('plan_estudios');
  const [soloTemas, setSoloTemas] = useState(false);
  const [documento, setDocumento] = useState('');
  const [impresiones, setImpresiones] = useState(0);
  const iframeRef = useRef(null);
  const { contenedorRef, thumb, onScroll, onArrastrarThumb } = useScrollbarPersonalizada();
  const visibles = filtrarMaterias(MATERIAS, filtro);
  const programas = [...new Set(MATERIAS.map((m) => m.programaEducativo))].map((id) => nombreDeCatalogo(PROGRAMAS_EDUCATIVOS, id));

  function marcar(ids, valor) {
    setElegidas((actual) => {
      const nuevo = new Set(actual);
      ids.forEach((id) => (valor ? nuevo.add(id) : nuevo.delete(id)));
      return nuevo;
    });
  }

  function generar() {
    const materias = MATERIAS.filter((m) => elegidas.has(m.id));
    setImpresiones((n) => n + 1);
    setDocumento(documentoPlanEstudios({
      materias,
      soloTemas,
      titulo: archivo.trim() || 'plan_estudios',
      institucion: PLANTEL?.institucion ?? '',
      programa: programas.join(' · '),
      fecha: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
    }));
  }

  function imprimir() {
    if (documento) iframeRef.current?.contentWindow?.print();
  }

  return (
    <div className="widget-resumen-plan-estudios">
      <div className="widget-resumen-plan-estudios-encabezado">
        <div className="widget-resumen-plan-estudios-tipo">Plan de estudios</div>
        <h1>{programas.join(' · ') || 'Plan de estudios'}</h1>
        {PLANTEL?.institucion && <div className="widget-resumen-plan-estudios-sub">{PLANTEL.institucion}</div>}
      </div>

      <div className="widget-resumen-plan-estudios-tarjetas">
        <div><strong>{cuatrimestresDe(MATERIAS).length}</strong><span>Cuatrimestres</span></div>
        <div><strong>{MATERIAS.length}</strong><span>Asignaturas</span></div>
        <div><strong>{elegidas.size}</strong><span>Seleccionadas</span></div>
      </div>

      <div className="widget-resumen-plan-estudios-filtro">
        <div className="widget-resumen-plan-estudios-buscar">
          <CampoTexto value={filtro} onChange={setFiltro} placeholder="Buscar por nombre, clave o contenido…" ariaLabel="Buscar materias" />
        </div>
        <span className="widget-resumen-plan-estudios-conteo">{visibles.length} materias</span>
        <BotonS variant="claro" onClick={() => marcar(visibles.map((m) => m.id), true)}>Seleccionar todas</BotonS>
        <BotonS variant="claro" onClick={() => marcar(visibles.map((m) => m.id), false)}>Quitar todas</BotonS>
      </div>

      <div className="widget-resumen-plan-estudios-zona">
      <div className="widget-resumen-plan-estudios-lista" ref={contenedorRef} onScroll={onScroll}>
        {visibles.length === 0 && <p className="widget-resumen-plan-estudios-vacio">Sin coincidencias.</p>}
        {visibles.map((m) => (
          <div key={m.id} className="widget-resumen-plan-estudios-materia">
            <Checkbox checked={elegidas.has(m.id)} onChange={(v) => marcar([m.id], v)} />
            <BadgeDinamico texto={m.clave} tono="azul" />
            <button type="button" className="widget-resumen-plan-estudios-nombre" onClick={() => setRegistroSeleccionadoId(m.id)}>{m.nombre}</button>
            <span className="widget-resumen-plan-estudios-cuatri">{nombreCuatrimestre(m.cuatrimestre)}</span>
          </div>
        ))}
      </div>
      {thumb.visible && (
        <div
          className="widget-resumen-plan-estudios-thumb"
          style={{ height: thumb.alto, top: thumb.top }}
          onMouseDown={onArrastrarThumb}
        />
      )}
      </div>

      <div className="widget-resumen-plan-estudios-pdf">
        <div className="widget-resumen-plan-estudios-archivo">
          <CampoTexto value={archivo} onChange={setArchivo} placeholder="Nombre del archivo PDF" ariaLabel="Nombre del archivo PDF" />
        </div>
        <Checkbox checked={soloTemas} onChange={setSoloTemas} label="Solo temas y subtemas" />
        <BotonS disabled={elegidas.size === 0} onClick={generar}>Generar PDF</BotonS>
        <p className="widget-resumen-plan-estudios-nota">
          {elegidas.size === 0 ? 'Selecciona al menos una materia.' : 'Se abrirá el diálogo de impresión: elige «Guardar como PDF».'}
        </p>
      </div>

      {documento && (
        <iframe
          key={impresiones}
          ref={iframeRef}
          className="widget-resumen-plan-estudios-impresion"
          title="Plan de estudios para imprimir"
          srcDoc={documento}
          onLoad={imprimir}
        />
      )}
    </div>
  );
}
