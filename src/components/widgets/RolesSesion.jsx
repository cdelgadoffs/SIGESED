import BadgeDinamico from '../base/BadgeDinamico.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import '../../styles/widgets/RolesSesion.css';

export default function RolesSesion() {
  const { ROLES } = useRegistros();
  const { rolActivo, alternarRol } = useAuth();
  if (ROLES.length === 0) return null;
  return (
    <div className="widget-roles-sesion">
      {ROLES.map((rol) => {
        const activo = rolActivo(rol.id);
        return (
          <BadgeDinamico
            key={rol.id}
            texto={rol.nombre}
            tono={activo ? 'verde' : 'gris'}
            title={activo ? `${rol.nombre}: activo (clic para desactivar)` : `${rol.nombre}: inactivo (clic para activar)`}
            onClick={() => alternarRol(rol.id)}
          />
        );
      })}
    </div>
  );
}
