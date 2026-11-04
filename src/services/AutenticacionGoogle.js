import { ApiError } from './ApiError.js';

const CLIENTE = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT = 'https://accounts.google.com/gsi/client';
const CLAVE = 'sesionGoogle';

let carga = null;
let receptor = null;

function cargarScript() {
  if (!CLIENTE) return Promise.reject(new ApiError('NO_DISPONIBLE', 'Falta configurar el acceso con Google (VITE_GOOGLE_CLIENT_ID).'));
  if (!carga) {
    carga = new Promise((resolver, rechazar) => {
      const script = document.createElement('script');
      script.src = SCRIPT;
      script.async = true;
      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: CLIENTE,
          callback: ({ credential }) => receptor?.(credential),
          auto_select: false,
          ux_mode: 'popup',
        });
        resolver(window.google.accounts.id);
      };
      script.onerror = () => {
        carga = null;
        rechazar(new ApiError('NO_DISPONIBLE', 'No se pudo cargar el acceso con Google. Revisa tu conexión.'));
      };
      document.head.appendChild(script);
    });
  }
  return carga;
}

export async function mostrarBotonGoogle(elemento, alRecibir) {
  const id = await cargarScript();
  receptor = alRecibir;
  id.renderButton(elemento, { type: 'standard', theme: 'outline', size: 'medium', text: 'signin', shape: 'rectangular', locale: 'es' });
}

export function guardarCredencialGoogle(credencial) {
  try {
    sessionStorage.setItem(CLAVE, credencial);
  } catch {
    return;
  }
}

export function recuperarSesionGoogle() {
  try {
    return sessionStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

export async function salirDeGoogle() {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    return;
  }
  if (window.google?.accounts?.id) window.google.accounts.id.disableAutoSelect();
}
