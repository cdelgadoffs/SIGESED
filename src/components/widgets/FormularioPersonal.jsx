import { useEffect, useState } from 'react';
import CampoFormulario from '../base/CampoFormulario.jsx';
import CampoTexto from '../base/CampoTexto.jsx';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import BotonS from '../base/BotonS.jsx';
import Checkbox from '../base/Checkbox.jsx';
import MarcoFormulario from './MarcoFormulario.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useFormularioRegistro } from '../../hooks/useFormularioRegistro.js';
import { estiloGenero, nombreCompleto } from '../../utils/registros.js';
import { capitalizarPalabras } from '../../utils/texto.js';
import { esCorreo, esTelefono, MENSAJES_FORMATO } from '../../utils/validaciones.js';
import '../../styles/widgets/FormularioPersonal.css';

const VACIO = { nombre: '', primerApellido: '', segundoApellido: '', telefono: '', correo: '', genero: '', roles: [] };

export default function FormularioPersonal() {
  const {
    PERSONAL, PLANTEL, GENEROS, ROLES,
    crearPersonal, editarPersonal, guardarBorrador, obtenerBorrador, eliminarBorrador,
  } = useRegistros();
  const { sidebar3Abierto, registroEnEdicionId, cerrarSidebar3, abrirPanelControl, setRegistroSeleccionadoId } = useUI();
  const registro = registroEnEdicionId ? PERSONAL.find((p) => p.id === registroEnEdicionId) ?? null : null;
  const { form, setCampos, reiniciar, apertura } = useFormularioRegistro({
    vacio: VACIO, registro, abierto: sidebar3Abierto, claveBorrador: 'formularioPersonal',
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

  const generoActual = GENEROS.find((g) => g.id === form.genero) ?? GENEROS[0];
  const estilo = estiloGenero(generoActual?.id);

  function alternarGenero() {
    const i = GENEROS.indexOf(generoActual);
    cambiar('genero', GENEROS[(i + 1) % GENEROS.length].id);
  }

  function titularesDe(rol) {
    return PERSONAL.filter((p) => p.id !== registro?.id && (p.roles || []).includes(rol.id));
  }

  function alternarRol(rolId, marcado) {
    const roles = marcado ? [...form.roles, rolId] : form.roles.filter((r) => r !== rolId);
    cambiar('roles', ROLES.map((r) => r.id).filter((id) => roles.includes(id)));
  }

  const errores = {
    telefono: form.telefono && !esTelefono(form.telefono) ? MENSAJES_FORMATO.telefono : null,
    correo: form.correo && !esCorreo(form.correo) ? MENSAJES_FORMATO.correo : null,
  };
  const completo = form.nombre.trim() && form.primerApellido.trim() && generoActual && form.roles.length > 0 && PLANTEL;
  const puedeConfirmar = !!completo && !Object.values(errores).some(Boolean) && !ocupado;

  async function confirmar() {
    setOcupado(true);
    setFallo(null);
    const datos = { ...form, genero: generoActual.id };
    try {
      if (registro) {
        await editarPersonal(registro.id, datos);
        cerrarSidebar3();
      } else {
        const nuevo = await crearPersonal(datos);
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
      <div className="widget-formulario-personal-fila">
        <CampoFormulario etiqueta="Nombre(s)" requerido>
          <CampoTexto
            value={form.nombre}
            onChange={(v) => cambiar('nombre', capitalizarPalabras(v))}
            enfocar={sidebar3Abierto ? `${apertura}:${altas}` : null}
          />
        </CampoFormulario>
        {generoActual && (
          <div className="widget-formulario-personal-genero">
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
      <CampoFormulario etiqueta="Roles" requerido>
        <div className="widget-formulario-personal-roles">
          {ROLES.map((rol) => {
            const marcado = form.roles.includes(rol.id);
            const titulares = rol.maximo ? titularesDe(rol) : [];
            const rolOcupado = !marcado && titulares.length >= rol.maximo && rol.maximo !== null;
            return (
              <Checkbox
                key={rol.id}
                checked={marcado}
                disabled={rolOcupado}
                label={rolOcupado ? `${rol.nombre} (${titulares.map(nombreCompleto).join(', ')})` : rol.nombre}
                onChange={(v) => alternarRol(rol.id, v)}
              />
            );
          })}
        </div>
      </CampoFormulario>
    </MarcoFormulario>
  );
}
