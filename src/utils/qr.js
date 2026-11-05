import QRCode from 'qrcode';
import jsQR from 'jsqr';

export function imagenQR(texto) {
  return QRCode.toDataURL(texto, { width: 480, margin: 1, errorCorrectionLevel: 'M' });
}

export function leerQR(imagen) {
  return jsQR(imagen.data, imagen.width, imagen.height, { inversionAttempts: 'dontInvert' })?.data ?? null;
}
