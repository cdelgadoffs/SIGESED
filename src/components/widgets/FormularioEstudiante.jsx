import { useEffect, useState } from 'react';
import CampoFormulario from '../base/CampoFormulario.jsx';
import CampoTexto from '../base/CampoTexto.jsx';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import ListaExpandible from '../base/ListaExpandible.jsx';
import BotonS from '../base/BotonS.jsx';
import MarcoFormulario from './MarcoFormulario.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useFormularioRegistro } from '../../hooks/useFormularioRegistro.js';
import { estiloGenero, nombreDeCatalogo, opcionesDeCatalogo } from '../../utils/registros.js';
import { capitalizarPalabras } from '../../utils/texto.js';
import { esCorreo, esTelefono, MENSAJES_FORMATO } from '../../utils/validaciones.js';
import '../../styles/widgets/FormularioEstudiante.css';

const VACIO = {
  nombre: '', primerApellido: '', segundoApellido: '', telefono: '', correo: '', genero: '',
  grupo: '', tiempo: '',
};

export default function FormularioEstudiante() {
  const {
    ESTUDIANTES, PLANTEL, GENEROS, GRUPOS, TIEMPOS, PROGRAMAS_EDUCATIVOS, MODALIDADES,
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
  const [cambiosGenero, setCambiosGenero] = useState(0);
  if (!sidebar3Abierto && cambiosGenero) setCambiosGenero(0);

  useEffect(() => {
    if (registroEnEdicionId && !registro) cerrarSidebar3();
  }, [registroEnEdicionId, registro]);

  function cambiar(campo, valor) {
    setCampos({ [campo]: valor });
    setFallo(null);
  }

  const grupoElegido = GRUPOS.find((g) => g.id === form.grupo);
  const generoActual = GENEROS.find((g) => g.id === form.genero) ?? GENEROS[0];
  const estilo = estiloGenero(generoActual?.id);

  function alternarGenero() {
    const i = GENEROS.indexOf(generoActual);
    cambiar('genero', GENEROS[(i + 1) % GENEROS.length].id);
    setCambiosGenero((n) => n + 1);
  }

  const errores = {
    telefono: form.telefono && !esTelefono(form.telefono) ? MENSAJES_FORMATO.telefono : null,
    correo: form.correo && !esCorreo(form.correo) ? MENSAJES_FORMATO.correo : null,
  };
  const completo = form.nombre.trim() && form.primerApellido.trim() && generoActual
    && form.grupo && form.tiempo && PLANTEL;
  const puedeConfirmar = !!completo && !Object.values(errores).some(Boolean) && !ocupado;

  async function confirmar() {
    setOcupado(true);
    setFallo(null);
    const datos = { ...form, genero: generoActual.id };
    try {
      if (registro) {
        await editarEstudiante(registro.id, datos);
        cerrarSidebar3();
      } else {
        const nuevo = await crearEstudiante(datos);
        setRegistroSeleccionadoId(nuevo.id);
        reiniciar();
        setAltas((n) => n + 1);
        setCambiosGenero(0);
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
      <CampoFormulario etiqueta="Apellido paterno" requerido medio>
        <CampoTexto
          value={form.primerApellido}
          onChange={(v) => cambiar('primerApellido', capitalizarPalabras(v))}
          enfocar={sidebar3Abierto ? `${apertura}:${altas}` : null}
        />
      </CampoFormulario>
      <CampoFormulario etiqueta="Apellido materno" medio>
        <CampoTexto value={form.segundoApellido} onChange={(v) => cambiar('segundoApellido', capitalizarPalabras(v))} />
      </CampoFormulario>
      <div className="widget-formulario-estudiante-fila">
        <CampoFormulario etiqueta="Nombre(s)" requerido>
          <CampoTexto
            value={form.nombre}
            onChange={(v) => cambiar('nombre', capitalizarPalabras(v))}
          />
        </CampoFormulario>
        {generoActual && (
          <div className="widget-formulario-estudiante-genero">
            <BadgeDinamico
              texto={generoActual.nombre}
              icono={estilo.icono}
              tono={estilo.tono}
              title="Cambiar género"
              onClick={alternarGenero}
            />
          </div>
        )}
      </div>
      <CampoFormulario etiqueta="Teléfono" medio error={errores.telefono}>
        <CampoTexto
          tipo="tel"
          value={form.telefono}
          onChange={(v) => cambiar('telefono', v)}
          placeholder="10 dígitos"
          enfocar={sidebar3Abierto && cambiosGenero ? `${apertura}:${cambiosGenero}` : null}
        />
      </CampoFormulario>
      <CampoFormulario etiqueta="Correo" medio error={errores.correo}>
        <CampoTexto tipo="email" value={form.correo} onChange={(v) => cambiar('correo', v)} />
      </CampoFormulario>
      <CampoFormulario etiqueta="Grupo" requerido medio error={GRUPOS.length === 0 ? 'Primero registra un grupo.' : null}>
        {selector('grupo', GRUPOS.map((g) => ({ id: g.id, nombre: g.nombre })))}
      </CampoFormulario>
      <CampoFormulario etiqueta="Tiempo" requerido medio>{selector('tiempo', TIEMPOS)}</CampoFormulario>
      <CampoFormulario etiqueta="Programa educativo" medio>
        <CampoTexto value={nombreDeCatalogo(PROGRAMAS_EDUCATIVOS, grupoElegido?.programaEducativo)} placeholder="Según el grupo" disabled />
      </CampoFormulario>
      <CampoFormulario etiqueta="Modalidad" medio>
        <CampoTexto value={nombreDeCatalogo(MODALIDADES, grupoElegido?.modalidad)} placeholder="Según el grupo" disabled />
      </CampoFormulario>
    </MarcoFormulario>
  );
}
