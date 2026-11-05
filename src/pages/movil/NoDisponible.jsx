import MarcoMovil from '../../components/base/MarcoMovil.jsx';
import NavegacionMovil from '../../components/widgets/NavegacionMovil.jsx';
import OpcionesCuentaMovil from '../../components/widgets/OpcionesCuentaMovil.jsx';

export default function NoDisponible() {
  return (
    <MarcoMovil titulo="SIGESED" accion={<OpcionesCuentaMovil />} navegacion={<NavegacionMovil />}>
      <p style={{ margin: '24px 8px', fontSize: 14.5, color: '#666', textAlign: 'center' }}>
        Esta sección está disponible en la versión de escritorio.
      </p>
    </MarcoMovil>
  );
}
