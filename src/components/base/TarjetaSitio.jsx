import '../../styles/base/TarjetaSitio.css';

export default function TarjetaSitio({ icono, titulo, texto, detalle, numero, children }) {
  return (
    <article className="base-tarjeta-sitio">
      <div className="base-tarjeta-sitio-cabeza">
        {icono && <span className="base-tarjeta-sitio-icono"><i className={icono} /></span>}
        {numero !== undefined && <span className="base-tarjeta-sitio-numero">{numero}</span>}
        {detalle && <span className="base-tarjeta-sitio-detalle">{detalle}</span>}
      </div>
      <h3>{titulo}</h3>
      {texto && <p>{texto}</p>}
      {children && <div className="base-tarjeta-sitio-extra">{children}</div>}
    </article>
  );
}
