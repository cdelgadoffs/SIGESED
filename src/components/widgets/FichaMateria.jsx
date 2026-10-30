import { useState } from 'react';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { nombreCuatrimestre, sinNumeroRomano, SIN_OBJETIVO, textoDeTema } from '../../utils/planEstudios.js';
import '../../styles/widgets/FichaMateria.css';

function Lista({ items }) {
  if (!items?.length) return <ul><li>No especificadas</li></ul>;
  return <ul>{items.map((i) => <li key={i}>{sinNumeroRomano(i)}</li>)}</ul>;
}

export default function FichaMateria() {
  const { MATERIAS } = useRegistros();
  const { registroSeleccionadoId } = useUI();
  const [copiado, setCopiado] = useState(null);
  const materia = MATERIAS.find((m) => m.id === registroSeleccionadoId);

  if (!materia) return <p className="widget-ficha-materia-mensaje">Elige una materia de la lista.</p>;

  function copiar(tema, indice) {
    navigator.clipboard.writeText(textoDeTema(tema)).then(() => {
      setCopiado(indice);
      setTimeout(() => setCopiado((c) => (c === indice ? null : c)), 1500);
    }).catch(() => {});
  }

  return (
    <div className="widget-ficha-materia" key={materia.id}>
      <div className="widget-ficha-materia-encabezado">
        <div className="widget-ficha-materia-tipo">Asignatura · {nombreCuatrimestre(materia.cuatrimestre)}</div>
        <h1 className="widget-ficha-materia-nombre">{materia.nombre}</h1>
        <BadgeDinamico texto={materia.clave} icono="ri-hashtag" tono="azul" title="Clave" />
        {materia.objetivo && materia.objetivo !== SIN_OBJETIVO && (
          <div className="widget-ficha-materia-objetivo">
            <span>Objetivo general</span>
            {materia.objetivo}
          </div>
        )}
      </div>

      {materia.temas?.length > 0 && (
        <>
          <div className="widget-ficha-materia-seccion">Temas y subtemas</div>
          {materia.temas.map((t, i) => (
            <div key={`${i}${t.titulo}`} className="widget-ficha-materia-tarjeta">
              <div className="widget-ficha-materia-tarjeta-titulo">
                <span>{t.titulo}</span>
                <button
                  type="button"
                  className="widget-ficha-materia-copiar"
                  title="Copiar tema"
                  onClick={() => copiar(t, i)}
                >
                  <i className={copiado === i ? 'ri-check-line' : 'ri-file-copy-line'} aria-hidden="true"></i>
                </button>
              </div>
              <Lista items={t.items} />
            </div>
          ))}
        </>
      )}

      <div className="widget-ficha-materia-seccion">Actividades de aprendizaje</div>
      <div className="widget-ficha-materia-columnas">
        <div className="widget-ficha-materia-tarjeta">
          <div className="widget-ficha-materia-tarjeta-titulo"><span>Bajo la conducción de un docente</span></div>
          <Lista items={materia.actividadesDocente} />
        </div>
        <div className="widget-ficha-materia-tarjeta">
          <div className="widget-ficha-materia-tarjeta-titulo"><span>Independientes</span></div>
          <Lista items={materia.actividadesIndependiente} />
        </div>
      </div>

      <div className="widget-ficha-materia-seccion">Criterios y procedimientos de evaluación</div>
      <table className="widget-ficha-materia-tabla">
        <thead><tr><th>Concepto</th><th>Porcentaje</th></tr></thead>
        <tbody>
          {materia.evaluacion?.length
            ? materia.evaluacion.map((e) => <tr key={e.concepto}><td>{e.concepto}</td><td>{e.porcentaje}</td></tr>)
            : <tr><td colSpan={2}>Sin información</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
