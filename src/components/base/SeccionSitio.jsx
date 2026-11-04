import '../../styles/base/SeccionSitio.css';

export default function SeccionSitio({ titulo, descripcion, fondo = 'claro', columnas = 3, children }) {
  return (
    <section className={`base-seccion-sitio base-seccion-sitio-${fondo}`}>
      <div className="base-seccion-sitio-interior">
        {(titulo || descripcion) && (
          <header className="base-seccion-sitio-encabezado">
            {titulo && <h2>{titulo}</h2>}
            {descripcion && <p>{descripcion}</p>}
          </header>
        )}
        <div className="base-seccion-sitio-rejilla" style={{ '--columnas': columnas }}>{children}</div>
      </div>
    </section>
  );
}
