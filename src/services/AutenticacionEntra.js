import { PublicClientApplication } from '@azure/msal-browser';
import { ApiError } from './ApiError.js';

const CLIENTE = import.meta.env.VITE_ENTRA_CLIENT_ID;
const INQUILINO = import.meta.env.VITE_ENTRA_TENANT_ID;
const AMBITO = import.meta.env.VITE_ENTRA_SCOPE;

let instancia = null;

function limpiarInteraccionPendiente() {
  try {
    Object.keys(sessionStorage)
      .filter((clave) => clave.includes('interaction.status'))
      .forEach((clave) => sessionStorage.removeItem(clave));
  } catch {
    return;
  }
}

function exigirConfiguracion() {
  if (!CLIENTE || !INQUILINO) throw new ApiError('NO_DISPONIBLE', 'Falta configurar Microsoft Entra ID (VITE_ENTRA_CLIENT_ID y VITE_ENTRA_TENANT_ID).');
}

async function cliente() {
  exigirConfiguracion();
  if (!instancia) {
    instancia = new PublicClientApplication({
      auth: {
        clientId: CLIENTE,
        authority: `https://login.microsoftonline.com/${INQUILINO}`,
        redirectUri: `${window.location.origin}/redirect.html`,
      },
      cache: { cacheLocation: 'sessionStorage' },
    });
    limpiarInteraccionPendiente();
    await instancia.initialize();
  }
  return instancia;
}

const ambitos = () => (AMBITO ? [AMBITO] : []);
const tokenDe = (resultado) => (AMBITO ? resultado.accessToken : resultado.idToken);

export async function entrarConMicrosoft() {
  const app = await cliente();
  const pedir = () => app.loginPopup({ scopes: ambitos(), prompt: 'select_account' });
  try {
    let resultado;
    try {
      resultado = await pedir();
    } catch (e) {
      if (e?.errorCode !== 'interaction_in_progress') throw e;
      limpiarInteraccionPendiente();
      resultado = await pedir();
    }
    app.setActiveAccount(resultado.account);
    return tokenDe(resultado);
  } catch (e) {
    if (e?.errorCode === 'user_cancelled' || e?.errorCode === 'popup_window_error') {
      throw new ApiError('CANCELADO', e.errorCode === 'popup_window_error'
        ? 'El navegador bloqueó la ventana de Microsoft. Permite las ventanas emergentes para este sitio.'
        : 'Se canceló el inicio de sesión.');
    }
    throw new ApiError('NO_AUTORIZADO', e?.errorMessage || e?.message || 'No se pudo iniciar sesión con Microsoft.');
  }
}

export async function recuperarSesionMicrosoft() {
  if (!CLIENTE || !INQUILINO) return null;
  const app = await cliente();
  const cuenta = app.getActiveAccount() ?? app.getAllAccounts()[0];
  if (!cuenta) return null;
  try {
    const resultado = await app.acquireTokenSilent({ scopes: ambitos(), account: cuenta });
    return tokenDe(resultado);
  } catch {
    return null;
  }
}

export async function salirDeMicrosoft() {
  if (!CLIENTE || !INQUILINO) return;
  const app = await cliente();
  const cuenta = app.getActiveAccount() ?? app.getAllAccounts()[0];
  await app.logoutRedirect({ account: cuenta ?? undefined, postLogoutRedirectUri: `${window.location.origin}/` });
}

export async function olvidarCuentaMicrosoft() {
  if (!CLIENTE || !INQUILINO) return;
  const app = await cliente();
  const cuenta = app.getActiveAccount() ?? app.getAllAccounts()[0];
  await app.clearCache(cuenta ? { account: cuenta } : undefined);
  app.setActiveAccount(null);
}
