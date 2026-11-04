import { useEffect, useState } from 'react';

function desdeRegistro(vacio, registro) {
  return Object.fromEntries(Object.keys(vacio).map((k) => {
    if (Array.isArray(vacio[k])) return [k, Array.isArray(registro[k]) ? registro[k] : []];
    return [k, registro[k] == null ? '' : String(registro[k])];
  }));
}

function igual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useFormularioRegistro({ vacio, registro, abierto, claveBorrador, guardarBorrador, obtenerBorrador, eliminarBorrador }) {
  const [form, setForm] = useState(vacio);
  const apertura = abierto ? (registro?.id ?? 'nuevo') : null;
  const [aperturaPrevia, setAperturaPrevia] = useState(null);
  const [restauradoPara, setRestauradoPara] = useState(null);
  const restaurado = apertura === 'nuevo' && restauradoPara === apertura;

  if (apertura !== aperturaPrevia) {
    setAperturaPrevia(apertura);
    setRestauradoPara(null);
    if (registro && abierto) setForm(desdeRegistro(vacio, registro));
  }

  useEffect(() => {
    if (apertura !== 'nuevo') return undefined;
    let cancelado = false;
    obtenerBorrador(claveBorrador)
      .catch(() => null)
      .then((borrador) => {
        if (cancelado) return;
        setForm(borrador ? { ...vacio, ...borrador } : vacio);
        setRestauradoPara('nuevo');
      });
    return () => {
      cancelado = true;
    };
  }, [apertura, claveBorrador, obtenerBorrador, vacio]);

  useEffect(() => {
    if (!restaurado) return undefined;
    const temporizador = setTimeout(() => {
      const conDatos = Object.keys(vacio).some((k) => !igual(form[k], vacio[k]));
      (conDatos ? guardarBorrador(claveBorrador, form) : eliminarBorrador(claveBorrador)).catch(() => {});
    }, 400);
    return () => clearTimeout(temporizador);
  }, [form, restaurado, claveBorrador, guardarBorrador, eliminarBorrador, vacio]);

  function setCampos(cambios) {
    setForm((f) => ({ ...f, ...cambios }));
  }

  function reiniciar() {
    setForm(vacio);
    eliminarBorrador(claveBorrador).catch(() => {});
  }

  return { form, setCampos, reiniciar, apertura };
}
