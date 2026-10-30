import { useEffect, useState } from 'react';
import CampoFormulario from '../base/CampoFormulario.jsx';
import CampoTexto from '../base/CampoTexto.jsx';
import ListaExpandible from '../base/ListaExpandible.jsx';
import BotonS from '../base/BotonS.jsx';
import MarcoFormulario from './MarcoFormulario.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useFormularioRegistro } from '../../hooks/useFormularioRegistro.js';
import { nombreDeCatalogo, opcionesDeCatalogo } from '../../utils/registros.js';
import { normalizarTexto } from '../../utils/texto.js';

const VACIO = { nombre: '', programaEducativo: '', modalidad: '' };

export default function FormularioGrupo() {
  const {
    GRUPOS, PLANTEL, PROGRAMAS_EDUCATIVOS, MODALIDADES,
    crearGrupo, editarGrupo, guardarBorrador, obtenerBorrador, eliminarBorrador,
  } = useRegistros();
  const { sidebar3Abierto, registroEnEdicionId, cerrarSidebar3, abrirPanelControl, setRegistroSeleccionadoId } = useUI();
  const registro = registroEnEdicionId ? GRUPOS.find((g) => g.id === registroEnEdicionId) ?? null : null;
  const { form, setCampos, reiniciar, apertura } = useFormularioRegistro({
    vacio: VACIO, registro, abierto: sidebar3Abierto, claveBorrador: 'formularioGrupo',
    guardarBorrador, obtenerBorrador, eliminarBorrador,
  });
  const [fallo, setFallo] = useState(null);
  const error = fallo && fallo.apertura === apertura ? fallo.mensaje : null;
  const [ocupado, setOcupado] = useState(false);
  const [altas, setAltas] = useState(0);

  useEffect(() => {
    if (registroEnEdicionId && !registro) cerrarSidebar3();
  }, [registroEnEdicionId, registro]);

  function cambiar(campo, valor) {
    setCampos({ [campo]: valor });
    setFallo(null);
  }

  const nombreRepetido = form.nombre.trim() && GRUPOS.some((g) => g.id !== registro?.id
    && normalizarTexto(g.nombre).replace(/\s+/g, ' ') === normalizarTexto(form.nombre).replace(/\s+/g, ' '));
  const completo = form.nombre.trim() && form.programaEducativo && form.modalidad && PLANTEL;
  const puedeConfirmar = !!completo && !nombreRepetido && !ocupado;

  async function confirmar() {
    setOcupado(true);
    setFallo(null);
    try {
      if (registro) {
        await editarGrupo(registro.id, form);
        cerrarSidebar3();
      } else {
        const nuevo = await crearGrupo(form);
        setRegistroSeleccionadoId(nuevo.id);
        reiniciar();
        setAltas((n) => n + 1);
      }
    } catch (e) {
      setFallo({ apertura, mensaje: e?.mensaje ?? 'No se pudo guardar el grupo.' });
    } finally {
      setOcupado(false);
    }
  }

  function selector(campo, catalogo) {
    return (
      <ListaExpandible
        valorActual={form[campo]}
        etiquetaActual={nombreDeCatalogo(catalogo, form[campo]) || 'Selecciona…'}
        opciones={opcionesDeCatalogo(catalogo)}
        onSeleccionar={(id) => cambiar(campo, id)}
      />
    );
  }

  return (
    <MarcoFormulario
      error={error}
      textoConfirmar={registro ? 'Guardar' : 'Añadir'}
      puedeConfirmar={puedeConfirmar}
      onCancelar={cerrarSidebar3}
      onConfirmar={confirmar}
    >
      {!PLANTEL && (
        <CampoFormulario etiqueta="Plantel" error="Configura los datos del plantel para poder registrar.">
          <div><BotonS variant="claro" onClick={() => abrirPanelControl('plantel')}>Ir al Panel de control</BotonS></div>
        </CampoFormulario>
      )}
      <CampoFormulario etiqueta="Nombre del grupo" requerido error={nombreRepetido ? 'Ya existe un grupo con ese nombre.' : null}>
        <CampoTexto
          value={form.nombre}
          onChange={(v) => cambiar('nombre', v)}
          enfocar={sidebar3Abierto ? `${apertura}:${altas}` : null}
        />
      </CampoFormulario>
      <CampoFormulario etiqueta="Programa educativo" requerido>{selector('programaEducativo', PROGRAMAS_EDUCATIVOS)}</CampoFormulario>
      <CampoFormulario etiqueta="Modalidad" requerido>{selector('modalidad', MODALIDADES)}</CampoFormulario>
    </MarcoFormulario>
  );
}
