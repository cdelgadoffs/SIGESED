import '../../styles/base/Sidebar3.css';

export default function Sidebar3({ abierto = true, izquierda = 0, arriba = 52, badge, titulo, onCerrar, mostrarCerrar = true, children }) {
  return (
    <aside className={'base-sidebar3' + (abierto ? '' : ' base-sidebar3-oculto')} style={{ left: izquierda, top: arriba, height: `calc(100vh - ${arriba}px)` }}>
      <div className="base-sidebar3-header">
        <div className="base-sidebar3-header-top">
          <div className="base-sidebar3-badge">{badge}</div>
          {mostrarCerrar && (
            <button type="button" className="base-sidebar3-cerrar" aria-label="Cerrar panel" onClick={onCerrar}>✕</button>
          )}
        </div>
        {titulo && <div className="base-sidebar3-titulo">{titulo}</div>}
      </div>
      {children}
    </aside>
  );
}
