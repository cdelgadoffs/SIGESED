import { useEffect, useRef, useState } from 'react';
import { leerQR } from '../../utils/qr.js';
import '../../styles/widgets/CamaraQR.css';

export default function CamaraQR({ onLeer }) {
  const videoRef = useRef(null);
  const lienzoRef = useRef(null);
  const onLeerRef = useRef(onLeer);
  const [error, setError] = useState(null);
  onLeerRef.current = onLeer;

  useEffect(() => {
    let flujo = null;
    let cuadro = 0;
    let vivo = true;

    function revisar() {
      if (!vivo) return;
      const video = videoRef.current;
      const lienzo = lienzoRef.current;
      if (video && lienzo && video.readyState >= 2 && video.videoWidth > 0) {
        lienzo.width = video.videoWidth;
        lienzo.height = video.videoHeight;
        const ctx = lienzo.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, lienzo.width, lienzo.height);
        const texto = leerQR(ctx.getImageData(0, 0, lienzo.width, lienzo.height));
        if (texto) {
          onLeerRef.current(texto);
          return;
        }
      }
      cuadro = requestAnimationFrame(revisar);
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Este navegador no permite usar la cámara (se necesita una conexión segura https).');
      return undefined;
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((s) => {
        if (!vivo) { s.getTracks().forEach((t) => t.stop()); return; }
        flujo = s;
        const video = videoRef.current;
        video.srcObject = s;
        video.setAttribute('playsinline', 'true');
        video.play().catch(() => {});
        cuadro = requestAnimationFrame(revisar);
      })
      .catch(() => setError('No se pudo abrir la cámara. Revisa que hayas dado permiso.'));

    return () => {
      vivo = false;
      cancelAnimationFrame(cuadro);
      flujo?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="widget-camara-qr">
      {error ? (
        <p className="widget-camara-qr-error">{error}</p>
      ) : (
        <>
          <video ref={videoRef} className="widget-camara-qr-video" muted playsInline />
          <div className="widget-camara-qr-marco" aria-hidden="true" />
          <canvas ref={lienzoRef} hidden />
        </>
      )}
    </div>
  );
}
