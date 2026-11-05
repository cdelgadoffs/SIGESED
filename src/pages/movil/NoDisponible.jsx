import MarcoMovil from '../../components/base/MarcoMovil.jsx';
import NavegacionMovil from '../../components/widgets/NavegacionMovil.jsx';
import MenuMovil from '../../components/widgets/MenuMovil.jsx';
import EscanerMovil from '../../components/widgets/EscanerMovil.jsx';

export default function NoDisponible() {
  return (
    <MarcoMovil titulo="SIGESED" accion={<MenuMovil />} navegacion={<NavegacionMovil />}
      flotante={<EscanerMovil />}>
      <p style={{ margin: '24px 8px', fontSize: 14.5, color: '#666', textAlign: 'center' }}>
        Esta sección está disponible en la versión de escritorio.
      </p>
    </MarcoMovil>
  );
}
