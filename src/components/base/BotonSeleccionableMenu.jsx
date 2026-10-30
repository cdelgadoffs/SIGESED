import '../../styles/base/BotonSeleccionableMenu.css';

export default function BotonSeleccionableMenu({ icono, activo = false, deshabilitado = false, completado = false, variante, badge, expandible = false, expandido = false, accion, onClick, children }) {
  return (
    <div
      className={
        'base-boton-seleccionable-menu' +
        (variante ? ` base-boton-seleccionable-menu-${variante}` : '') +
        (activo ? ' base-boton-seleccionable-menu-activo' : '') +
        (completado ? ' base-boton-seleccionable-menu-completado' : '') +
        (deshabilitado ? ' base-boton-seleccionable-menu-deshabilitado' : '')
      }
      onClick={deshabilitado ? undefined : onClick}
    >
      {icono
        ? <i className={`${icono} base-boton-seleccionable-menu-icono`} aria-hidden="true"></i>
        : <span className="base-boton-seleccionable-menu-punto"></span>}
      <span>{children}</span>
      {badge !== undefined && (
        <span className="base-boton-seleccionable-menu-badge">{badge}</span>
      )}
      {expandible && (
        <i
          className={
            'ri-arrow-right-s-line base-boton-seleccionable-menu-chevron' +
            (expandido ? ' base-boton-seleccionable-menu-chevron-expandido' : '')
          }
          aria-hidden="true"
        ></i>
      )}
      {accion}
    </div>
  );
}
