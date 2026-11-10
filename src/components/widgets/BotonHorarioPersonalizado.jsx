import BotonS from '../base/BotonS.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { NUEVO_PERSONALIZADO } from '../../utils/inscripciones.js';

export default function BotonHorarioPersonalizado({ grupoId }) {
  const { puede } = useAuth();
  const { abrirHorarioPersonalizado } = useUI();
  if (!grupoId || !puede('inicio', 'editar')) return null;
  return (
    <BotonS variant="claro" onClick={() => abrirHorarioPersonalizado(grupoId, NUEVO_PERSONALIZADO)}>
      <i className="ri-user-settings-line" /> Horario personalizado
    </BotonS>
  );
}
