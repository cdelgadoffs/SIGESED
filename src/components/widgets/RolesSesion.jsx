import BadgeDinamico from '../base/BadgeDinamico.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import '../../styles/widgets/RolesSesion.css';

export default function RolesSesion() {
  const { ROLES } = useRegistros();
  const { cuentaActiva, rolActivo, alternarRol, rolesSesion } = useAuth();
  const propios = ROLES.filter((r) => rolesSesion.includes(r.id));
  if (!cuentaActiva) return null;
  return (
    <>
      {cuentaActiva.correo && (
        <div className="widget-roles-sesion-correo" title={cuentaActiva.correo}>
          <i className="ri-mail-line" /> {cuentaActiva.correo}
        </div>
      )}
      {propios.length > 0 && (
        <div className="widget-roles-sesion">
          {propios.map((rol) => {
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
      )}
    </>
  );
}
