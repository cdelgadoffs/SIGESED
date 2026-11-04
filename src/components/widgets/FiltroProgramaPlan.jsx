import ListaExpandible from '../base/ListaExpandible.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { nombreDeCatalogo } from '../../utils/registros.js';
import { programaVigente } from '../../utils/planEstudios.js';
import '../../styles/widgets/FiltroProgramaPlan.css';

export default function FiltroProgramaPlan() {
  const { MATERIAS, PROGRAMAS_EDUCATIVOS } = useRegistros();
  const { programaPlanEstudios, setProgramaPlanEstudios, setRegistroSeleccionadoId } = useUI();
  const vigente = programaVigente(MATERIAS, programaPlanEstudios);
  if (!vigente) return null;
  const opciones = [...new Set(MATERIAS.map((m) => m.programaEducativo))].map((id) => ({
    id,
    label: nombreDeCatalogo(PROGRAMAS_EDUCATIVOS, id),
  }));
  return (
    <div className="widget-filtro-programa-plan">
      <ListaExpandible
        valorActual={vigente}
        etiquetaActual={opciones.find((o) => o.id === vigente)?.label}
        opciones={opciones}
        onSeleccionar={(id) => {
          setProgramaPlanEstudios(id);
          setRegistroSeleccionadoId(null);
        }}
      />
    </div>
  );
}
