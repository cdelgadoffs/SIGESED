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
import { capitalizarPalabras } from '../../utils/texto.js';
import { esCorreo, esTelefono, MENSAJES_FORMATO } from '../../utils/validaciones.js';

const VACIO = {
  nombre: '', primerApellido: '', segundoApellido: '', telefono: '', correo: '',
  programaEducativo: '', tiempo: '', modalidad: '',
};

export default function FormularioEstudiante() {
  const {
    ESTUDIANTES, PLANTEL, PROGRAMAS_EDUCATIVOS, TIEMPOS, MODALIDADES,
    crearEstudiante, editarEstudiante, guardarBorrador, obtenerBorrador, eliminarBorrador,
  } = useRegistros();
  const { sidebar3Abierto, registroEnEdicionId, cerrarSidebar3, abrirPanelControl, setRegistroSeleccionadoId } = useUI();
  const registro = registroEnEdicionId ? ESTUDIANTES.find((e) => e.id === registroEnEdicionId) ?? null : null;
  const { form, setCampos, reiniciar, apertura } = useFormularioRegistro({
    vacio: VACIO, registro, abierto: sidebar3Abierto, claveBorrador: 'formularioEstudiante',
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

  const errores = {
    telefono: form.telefono && !esTelefono(form.telefono) ? MENSAJES_FORMATO.telefono : null,
    correo: form.correo && !esCorreo(form.correo) ? MENSAJES_FORMATO.correo : null,
  };
  const completo = form.nombre.trim() && form.primerApellido.trim()
    && form.programaEducativo && form.tiempo && form.modalidad && PLANTEL;
  const puedeConfirmar = !!completo && !Object.values(errores).some(Boolean) && !ocupado;

  async function confirmar() {
    setOcupado(true);
    setFallo(null);
    try {
      if (registro) {
        await editarEstudiante(registro.id, form);
        cerrarSidebar3();
      } else {
        const nuevo = await crearEstudiante(form);
        setRegistroSeleccionadoId(nuevo.id);
        reiniciar();
        setAltas((n) => n + 1);
      }
    } catch (e) {
      setFallo({ apertura, mensaje: e?.mensaje ?? 'No se pudo guardar el registro.' });
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
      {registro && (
        <CampoFormulario etiqueta="Matrícula">
          <CampoTexto value={registro.matricula} disabled />
        </CampoFormulario>
      )}
      <CampoFormulario etiqueta="Nombre(s)" requerido>
        <CampoTexto
          value={form.nombre}
          onChange={(v) => cambiar('nombre', capitalizarPalabras(v))}
          enfocar={sidebar3Abierto ? `${apertura}:${altas}` : null}
        />
      </CampoFormulario>
      <CampoFormulario etiqueta="Apellido paterno" requerido medio>
        <CampoTexto value={form.primerApellido} onChange={(v) => cambiar('primerApellido', capitalizarPalabras(v))} />
      </CampoFormulario>
      <CampoFormulario etiqueta="Apellido materno" medio>
        <CampoTexto value={form.segundoApellido} onChange={(v) => cambiar('segundoApellido', capitalizarPalabras(v))} />
      </CampoFormulario>
      <CampoFormulario etiqueta="Teléfono" medio error={errores.telefono}>
        <CampoTexto tipo="tel" value={form.telefono} onChange={(v) => cambiar('telefono', v)} placeholder="10 dígitos" />
      </CampoFormulario>
      <CampoFormulario etiqueta="Correo" medio error={errores.correo}>
        <CampoTexto tipo="email" value={form.correo} onChange={(v) => cambiar('correo', v)} />
      </CampoFormulario>
      <CampoFormulario etiqueta="Programa educativo" requerido>{selector('programaEducativo', PROGRAMAS_EDUCATIVOS)}</CampoFormulario>
      <CampoFormulario etiqueta="Tiempo" requerido medio>{selector('tiempo', TIEMPOS)}</CampoFormulario>
      <CampoFormulario etiqueta="Modalidad" requerido medio>{selector('modalidad', MODALIDADES)}</CampoFormulario>
    </MarcoFormulario>
  );
}
