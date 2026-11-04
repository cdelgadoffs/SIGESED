import Card from '../base/Card.jsx';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import BotonS from '../base/BotonS.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { ESTADOS_CICLO, diasEntre, fechaDiaMes, hoyLocal } from '../../utils/fechas.js';
import { inscripcionDe, textoHorario, tipoHorario } from '../../utils/inscripciones.js';
import { nombreCompleto, nombreDeCatalogo } from '../../utils/registros.js';
import '../../styles/widgets/ResumenCiclo.css';

function Dato({ etiqueta, valor, detalle }) {
  return (
    <div className="widget-resumen-ciclo-dato">
      <span className="widget-resumen-ciclo-dato-etiqueta">{etiqueta}</span>
      <span className="widget-resumen-ciclo-dato-valor">{valor}</span>
      {detalle && <span className="widget-resumen-ciclo-dato-detalle">{detalle}</span>}
    </div>
  );
}

function avanceDe(ciclo, hoy) {
  if (!ciclo.fechaInicio || !ciclo.fechaFin) return null;
  if (hoy < ciclo.fechaInicio) return 0;
  if (hoy > ciclo.fechaFin) return 100;
  const total = diasEntre(ciclo.fechaInicio, ciclo.fechaFin) + 1;
  return Math.round(((diasEntre(ciclo.fechaInicio, hoy) + 1) / total) * 100);
}

export default function ResumenCiclo() {
  const { CICLOS, cicloActivoId, GRUPOS, MODALIDADES, MATERIAS, HORAS_CLASE, PERSONAL, INSCRIPCIONES, CARGA } = useRegistros();
  const { abrirPanelControl } = useUI();
  const ciclo = CICLOS.find((c) => c.id === cicloActivoId);
  const hoy = hoyLocal();

  if (!ciclo) {
    return (
      <div className="widget-resumen-ciclo-mensaje">
        <p>{CARGA.ciclos.cargando ? 'Cargando…' : 'Aún no hay ciclos escolares.'}</p>
        {!CARGA.ciclos.cargando && <BotonS variant="claro" onClick={() => abrirPanelControl('calendarizacion')}>Crear la calendarización anual</BotonS>}
      </div>
    );
  }

  const estado = ESTADOS_CICLO[ciclo.estado] ?? ESTADOS_CICLO['sin-configurar'];
  const inscritos = GRUPOS
    .map((g) => ({ grupo: g, materias: inscripcionDe(INSCRIPCIONES, ciclo.id, g.id)?.materias ?? [] }))
    .filter((e) => e.materias.length > 0);
  const docentes = new Set(inscritos.flatMap((e) => e.materias.map((m) => m.docenteId)).filter(Boolean));
  const totalMaterias = inscritos.reduce((n, e) => n + e.materias.length, 0);
  const avance = avanceDe(ciclo, hoy);

  let tiempo = { etiqueta: 'Duración', valor: '—' };
  if (ciclo.estado === 'proximo') {
    const faltan = diasEntre(hoy, ciclo.fechaInicio);
    tiempo = { etiqueta: 'Comienza en', valor: `${faltan} ${faltan === 1 ? 'día' : 'días'}`, detalle: fechaDiaMes(ciclo.fechaInicio) };
  } else if (ciclo.estado === 'en-curso') {
    const restan = diasEntre(hoy, ciclo.fechaFin);
    tiempo = { etiqueta: 'Termina en', valor: `${restan} ${restan === 1 ? 'día' : 'días'}`, detalle: fechaDiaMes(ciclo.fechaFin) };
  } else if (ciclo.estado === 'concluido') {
    tiempo = { etiqueta: 'Terminó', valor: fechaDiaMes(ciclo.fechaFin) };
  }

  return (
    <div className="widget-resumen-ciclo">
      <Card>
        <div className="widget-resumen-ciclo-encabezado">
          <span className="widget-resumen-ciclo-titulo">Ciclo escolar {ciclo.id}</span>
          {ciclo.cerrado
            ? <BadgeDinamico texto="Cerrado" icono="ri-lock-line" tono="gris" />
            : ciclo.iniciado && <BadgeDinamico texto="Iniciado" icono="ri-play-circle-line" tono="verde" />}
          <BadgeDinamico texto={estado.texto} tono={estado.tono} />
        </div>
        <div className="widget-resumen-ciclo-datos">
          <Dato etiqueta="Semana actual" valor={ciclo.semanaActual?.nombre ?? '—'} detalle={ciclo.asuetoHoy ? 'Hoy es asueto' : null} />
          <Dato {...tiempo} />
          <Dato etiqueta="Grupos" valor={inscritos.length} />
          <Dato etiqueta="Materias" valor={totalMaterias} />
          <Dato etiqueta="Docentes" valor={docentes.size} />
        </div>
        {avance !== null && (
          <div className="widget-resumen-ciclo-avance">
            <div className="widget-resumen-ciclo-avance-texto">
              <span>Avance del ciclo</span>
              <span>{`${avance}%`}</span>
            </div>
            <div className="widget-resumen-ciclo-barra"><div style={{ width: `${avance}%` }} /></div>
          </div>
        )}
      </Card>

      {inscritos.length === 0 ? (
        <p className="widget-resumen-ciclo-vacio">Ningún grupo está inscrito en este ciclo.</p>
      ) : inscritos.map(({ grupo, materias }) => {
        const tipo = tipoHorario(grupo, MODALIDADES);
        return (
          <Card key={grupo.id}>
            <div className="widget-resumen-ciclo-grupo">
              <span className="widget-resumen-ciclo-grupo-nombre">{grupo.nombre}</span>
              <BadgeDinamico texto={nombreDeCatalogo(MODALIDADES, grupo.modalidad)} tono="gris" />
            </div>
            <div className="widget-resumen-ciclo-materias">
              {materias.map((m) => {
                const materia = MATERIAS.find((x) => x.id === m.materia);
                const docente = PERSONAL.find((p) => p.id === m.docenteId);
                return (
                  <div key={m.materia} className="widget-resumen-ciclo-materia">
                    <span className="widget-resumen-ciclo-materia-nombre">{materia ? `${materia.clave} · ${materia.nombre}` : m.materia}</span>
                    <span>{docente ? nombreCompleto(docente) : 'Sin docente'}</span>
                    <span className="widget-resumen-ciclo-materia-horario">
                      {tipo === null ? 'Online, sin horario' : (textoHorario(m.horario, HORAS_CLASE) || 'Sin horario')}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
