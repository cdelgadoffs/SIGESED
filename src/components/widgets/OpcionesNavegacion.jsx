import BotonIcono from '../base/BotonIcono.jsx';
import '../../styles/widgets/OpcionesNavegacion.css';

const ICONOS = {
  horizontal: ['ri-arrow-left-s-line', 'ri-arrow-right-s-line'],
  vertical: ['ri-arrow-up-s-line', 'ri-arrow-down-s-line'],
};

export default function OpcionesNavegacion({
  orientacion = 'horizontal',
  onAnterior, onSiguiente,
  anteriorDeshabilitado, siguienteDeshabilitado,
  etiquetaAnterior, etiquetaSiguiente,
  children,
}) {
  const [iconoAnterior, iconoSiguiente] = ICONOS[orientacion];
  return (
    <div className={`widget-opciones-navegacion widget-opciones-navegacion-${orientacion}`}>
      <BotonIcono icono={iconoAnterior} ariaLabel={etiquetaAnterior} onClick={onAnterior} disabled={anteriorDeshabilitado} />
      <BotonIcono icono={iconoSiguiente} ariaLabel={etiquetaSiguiente} onClick={onSiguiente} disabled={siguienteDeshabilitado} />
      {children}
    </div>
  );
}
