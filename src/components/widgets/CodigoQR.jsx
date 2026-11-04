import { useEffect, useState } from 'react';
import { imagenQR } from '../../utils/qr.js';
import '../../styles/widgets/CodigoQR.css';

export default function CodigoQR({ texto, leyenda, nombreArchivo }) {
  const [imagen, setImagen] = useState(null);

  useEffect(() => {
    let cancelado = false;
    imagenQR(texto).then((url) => { if (!cancelado) setImagen(url); }).catch(() => {});
    return () => { cancelado = true; };
  }, [texto]);

  return (
    <figure className="widget-codigo-qr">
      {imagen ? <img src={imagen} alt={`Código QR: ${texto}`} /> : <div className="widget-codigo-qr-vacio" />}
      <figcaption>{leyenda}</figcaption>
      {imagen && (
        <a className="widget-codigo-qr-descargar" href={imagen} download={`${nombreArchivo}.png`}>
          <i className="ri-download-2-line" /> Descargar
        </a>
      )}
    </figure>
  );
}
