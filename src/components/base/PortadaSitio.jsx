import '../../styles/base/PortadaSitio.css';

export default function PortadaSitio({ etiqueta, titulo, subtitulo, icono, compacta = false, children }) {
  return (
    <section className={'base-portada-sitio' + (compacta ? ' base-portada-sitio-compacta' : '')}>
      <div className="base-portada-sitio-contenido">
        {etiqueta && <span className="base-portada-sitio-etiqueta">{etiqueta}</span>}
        <h1>{titulo}</h1>
        {subtitulo && <p>{subtitulo}</p>}
        {children && <div className="base-portada-sitio-acciones">{children}</div>}
      </div>
      {icono && <i className={`base-portada-sitio-icono ${icono}`} />}
    </section>
  );
}
