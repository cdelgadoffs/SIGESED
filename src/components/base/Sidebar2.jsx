import '../../styles/base/Sidebar2.css';

export default function Sidebar2({ abierto = true, izquierda = 0, arriba = 52, badge, subtitulo, accionesHeader, onCerrar, mostrarCerrar = true, children }) {
  return (
    <aside className={'base-sidebar2' + (abierto ? '' : ' base-sidebar2-oculto')} style={{ left: izquierda, top: arriba, height: `calc(100vh - ${arriba}px)` }}>
      <div className="base-sidebar2-header">
        <div className="base-sidebar2-header-top">
          <div className="base-sidebar2-badge">{badge}</div>
          <div className="base-sidebar2-header-acciones">
            {accionesHeader}
            {mostrarCerrar && (
              <button type="button" className="base-sidebar2-cerrar" aria-label="Cerrar panel" onClick={onCerrar}>✕</button>
            )}
          </div>
        </div>
        <div className="base-sidebar2-subtitle">{subtitulo}</div>
      </div>
      {children}
    </aside>
  );
}
