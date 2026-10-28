import { useEffect, useState } from 'react';
import '../../styles/base/FechaDia.css';

export default function FechaDia() {
  const [fechaTexto, setFechaTexto] = useState('');

  useEffect(() => {
    const ahora = new Date();
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setFechaTexto(ahora.toLocaleDateString('es-ES', opciones));
  }, []);

  return <span className="base-fecha-dia">{fechaTexto}</span>;
}
