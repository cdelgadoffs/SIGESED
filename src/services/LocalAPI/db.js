import { ApiError } from '../ApiError.js';
import { CATALOGOS_SEMILLA } from './semilla.js';

const DB_NAME = 'LocalAPI';
const DB_VERSION = 11;

export const STORE_CATALOGOS = 'catalogos';
export const STORE_UNICOS = 'unicos';
export const STORE_PERSONAL = 'personal';
export const STORE_ESTUDIANTES = 'estudiantes';
export const STORE_CICLOS = 'ciclos';
export const STORE_EVALUACIONES = 'evaluaciones';
export const STORE_GRUPOS = 'grupos';

function quitarCamposPersonal(store) {
  store.getAll().onsuccess = (evento) => {
    evento.target.result.forEach((persona) => {
      const limpio = { ...persona };
      delete limpio.curp;
      delete limpio.puesto;
      delete limpio.estatus;
      store.put(limpio);
    });
  };
}

function agregarRolesVacios(store) {
  store.getAll().onsuccess = (evento) => {
    evento.target.result.forEach((persona) => store.put({ ...persona, roles: persona.roles ?? [] }));
  };
}

function agregarGeneroVacio(store) {
  store.getAll().onsuccess = (evento) => {
    evento.target.result.forEach((estudiante) => store.put({ ...estudiante, genero: estudiante.genero ?? '' }));
  };
}

function pasarEstudiantesAGrupo(store) {
  store.getAll().onsuccess = (evento) => {
    evento.target.result.forEach((estudiante) => {
      const limpio = { ...estudiante, grupo: estudiante.grupo ?? '' };
      delete limpio.programaEducativo;
      delete limpio.modalidad;
      store.put(limpio);
    });
  };
}

let conexion = null;

function abrirDB() {
  if (!conexion) {
    conexion = conectar().catch((e) => {
      conexion = null;
      throw e;
    });
  }
  return conexion;
}

function conectar() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    let bloqueada = false;
    req.onblocked = () => {
      bloqueada = true;
      reject(new ApiError('NO_DISPONIBLE', 'Hay otra pestaña de la aplicación con una versión anterior abierta. Ciérrala o recárgala e intenta de nuevo.'));
    };
    req.onupgradeneeded = (evento) => {
      const db = req.result;
      const anterior = evento.oldVersion;
      if (anterior > 0 && anterior < 2) {
        ['planteles', STORE_PERSONAL].forEach((nombre) => {
          if (db.objectStoreNames.contains(nombre)) db.deleteObjectStore(nombre);
        });
      }
      if (anterior === 2) quitarCamposPersonal(req.transaction.objectStore(STORE_PERSONAL));
      if (anterior === 4) {
        db.deleteObjectStore(STORE_CATALOGOS);
        agregarRolesVacios(req.transaction.objectStore(STORE_PERSONAL));
      }
      if (anterior > 0 && anterior < 4) {
        [STORE_CATALOGOS, STORE_ESTUDIANTES, 'contadores'].forEach((nombre) => {
          if (db.objectStoreNames.contains(nombre)) db.deleteObjectStore(nombre);
        });
      }
      if (anterior >= 5 && anterior < 11) db.deleteObjectStore(STORE_CATALOGOS);
      if (anterior >= 4 && anterior < 8) agregarGeneroVacio(req.transaction.objectStore(STORE_ESTUDIANTES));
      if (anterior >= 4 && anterior < 9) pasarEstudiantesAGrupo(req.transaction.objectStore(STORE_ESTUDIANTES));
      [STORE_PERSONAL, STORE_ESTUDIANTES, STORE_CICLOS, STORE_EVALUACIONES, STORE_GRUPOS].forEach((nombre) => {
        if (!db.objectStoreNames.contains(nombre)) db.createObjectStore(nombre, { keyPath: 'id' });
      });
      if (!db.objectStoreNames.contains(STORE_UNICOS)) db.createObjectStore(STORE_UNICOS, { keyPath: 'clave' });
      if (!db.objectStoreNames.contains(STORE_CATALOGOS)) {
        const store = db.createObjectStore(STORE_CATALOGOS, { keyPath: 'nombre' });
        Object.entries(CATALOGOS_SEMILLA).forEach(([nombre, items]) => store.put({ nombre, items }));
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      if (bloqueada) {
        db.close();
        return;
      }
      db.onversionchange = () => {
        db.close();
        conexion = null;
      };
      resolve(db);
    };
    req.onerror = () => reject(req.error);
  });
}

async function pedir(store, modo, operacion) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, modo);
    const req = operacion(tx.objectStore(store));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export function obtenerTodos(store) {
  return pedir(store, 'readonly', (s) => s.getAll()).then((r) => r || []);
}

export function obtener(store, id) {
  return pedir(store, 'readonly', (s) => s.get(id));
}

export function guardar(store, valor) {
  return pedir(store, 'readwrite', (s) => s.put(valor));
}

export async function escribirVarios({ poner = [], borrar = [] }) {
  if (poner.length === 0 && borrar.length === 0) return;
  const db = await abrirDB();
  const stores = [...new Set([...poner.map((e) => e.store), ...borrar.map((e) => e.store)])];
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, 'readwrite');
    poner.forEach(({ store, valor }) => tx.objectStore(store).put(valor));
    borrar.forEach(({ store, id }) => tx.objectStore(store).delete(id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
