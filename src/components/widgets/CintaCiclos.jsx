import { useState } from 'react';
import FechasSesiones from '../base/FechasSesiones.jsx';
import ListaExpandible from '../base/ListaExpandible.jsx';
import BotonIcono from '../base/BotonIcono.jsx';
import OpcionesNavegacion from './OpcionesNavegacion.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { ESTADOS_CICLO } from '../../utils/fechas.js';
import '../../styles/widgets/CintaCiclos.css';

export default function CintaCiclos() {
  const { CICLOS, cicloActivoId, seleccionarCiclo, CARGA } = useRegistros();
  const [anioManual, setAnioManual] = useState(null);

  const anioActivo = CICLOS.find((c) => c.id === cicloActivoId)?.anio ?? null;
  const anio = anioManual ?? anioActivo ?? new Date().getFullYear();
  const anios = Array.from(new Set([...CICLOS.map((c) => c.anio), anio])).sort((a, b) => a - b);
  const ciclos = CICLOS
    .filter((c) => c.anio === anio)
    .map((c) => ({ id: c.id, label: c.id, estado: (ESTADOS_CICLO[c.estado] ?? ESTADOS_CICLO['sin-configurar']).cinta }));
  const mostrarVolver = anioActivo !== null && anioActivo !== anio;

  let textoVacio = `No hay ciclos en ${anio}.`;
  if (CARGA.ciclos.error) textoVacio = `No se pudieron cargar los ciclos: ${CARGA.ciclos.error.mensaje}`;
  else if (CICLOS.length === 0) textoVacio = CARGA.ciclos.cargando ? 'Cargando…' : 'Aún no hay ciclos. Créalos en Panel de control › Calendarización anual.';

  return (
    <div className="widget-cinta-ciclos">
      <OpcionesNavegacion
        onAnterior={() => setAnioManual(anio - 1)}
        onSiguiente={() => setAnioManual(anio + 1)}
        etiquetaAnterior="Año anterior"
        etiquetaSiguiente="Año siguiente"
      >
        {mostrarVolver && (
          <BotonIcono icono="ri-arrow-go-back-line" ariaLabel="Volver al ciclo activo" onClick={() => setAnioManual(null)} />
        )}
      </OpcionesNavegacion>
      <ListaExpandible
        valorActual={anio}
        etiquetaActual={`Ciclos ${anio}`}
        opciones={anios.map((a) => ({ id: a, label: `Ciclos ${a}` }))}
        onSeleccionar={setAnioManual}
      />
      <FechasSesiones fechas={ciclos} activaId={cicloActivoId} onSeleccionar={seleccionarCiclo} textoVacio={textoVacio} />
    </div>
  );
}
