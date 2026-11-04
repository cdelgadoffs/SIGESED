import QRCode from 'qrcode';

export function imagenQR(texto) {
  return QRCode.toDataURL(texto, { width: 480, margin: 1, errorCorrectionLevel: 'M' });
}
