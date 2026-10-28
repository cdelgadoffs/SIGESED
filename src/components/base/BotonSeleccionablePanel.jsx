import '../../styles/base/BotonSeleccionablePanel.css';

export default function BotonSeleccionablePanel({ activo = false, onClick, children }) {
  return (
    <div
      className={'base-boton-seleccionable-panel' + (activo ? ' base-boton-seleccionable-panel-activo' : '')}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
