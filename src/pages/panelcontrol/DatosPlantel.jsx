import { useEffect, useState } from 'react';
import CampoFormulario from '../../components/base/CampoFormulario.jsx';
import CampoTexto from '../../components/base/CampoTexto.jsx';
import ListaExpandible from '../../components/base/ListaExpandible.jsx';
import MarcoFormulario from '../../components/widgets/MarcoFormulario.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useFormularioRegistro } from '../../hooks/useFormularioRegistro.js';
import { nombreDeCatalogo, opcionesDeCatalogo } from '../../utils/registros.js';
import { esCCT, esTelefono, MENSAJES_FORMATO } from '../../utils/validaciones.js';

const VACIO = { cct: '', nombre: '', nivel: '', turno: '', municipio: '', domicilio: '', telefono: '' };
const CLAVE_BORRADOR = 'datosPlantel';

export default function DatosPlantel() {
  const {
    PLANTEL, NIVELES_EDUCATIVOS, TURNOS, CARGA,
    guardarPlantel, guardarBorrador, obtenerBorrador, eliminarBorrador,
  } = useRegistros();
  const { setPanelControlActivo, setSidebar5Ancho } = useUI();
  const { form, setCampos, apertura } = useFormularioRegistro({
    vacio: VACIO, registro: PLANTEL, abierto: true, claveBorrador: CLAVE_BORRADOR,
    guardarBorrador, obtenerBorrador, eliminarBorrador,
  });
  const [fallo, setFallo] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const error = fallo && fallo.apertura === apertura ? fallo.mensaje : null;

  useEffect(() => {
    setSidebar5Ancho(true);
    return () => setSidebar5Ancho(false);
  }, [setSidebar5Ancho]);

  function cambiar(campo, valor) {
    setCampos({ [campo]: valor });
    setFallo(null);
  }

  const errores = {
    cct: form.cct && !esCCT(form.cct) ? MENSAJES_FORMATO.cct : null,
    telefono: form.telefono && !esTelefono(form.telefono) ? MENSAJES_FORMATO.telefono : null,
  };
  const completo = form.cct.trim() && form.nombre.trim() && form.nivel && form.turno && form.municipio.trim();
  const puedeConfirmar = !!completo && !Object.values(errores).some(Boolean) && !ocupado;

  async function confirmar() {
    setOcupado(true);
    setFallo(null);
    try {
      await guardarPlantel(form);
      eliminarBorrador(CLAVE_BORRADOR).catch(() => {});
      setPanelControlActivo(null);
    } catch (e) {
      setFallo({ apertura, mensaje: e?.mensaje ?? 'No se pudieron guardar los datos del plantel.' });
    } finally {
      setOcupado(false);
    }
  }

  if (!PLANTEL && CARGA.plantel.cargando) {
    return <p style={{ margin: '16px 20px', fontSize: 13, color: '#999' }}>Cargando…</p>;
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
      oscuro
      error={error ?? (CARGA.plantel.error && `No se pudo cargar el plantel: ${CARGA.plantel.error.mensaje}`)}
      textoConfirmar="Guardar"
      puedeConfirmar={puedeConfirmar}
      onCancelar={() => setPanelControlActivo(null)}
      onConfirmar={confirmar}
    >
      <CampoFormulario etiqueta="Nombre del plantel" requerido>
        <CampoTexto value={form.nombre} onChange={(v) => cambiar('nombre', v)} />
      </CampoFormulario>
      <CampoFormulario etiqueta="CCT" requerido medio error={errores.cct}>
        <CampoTexto value={form.cct} onChange={(v) => cambiar('cct', v.toUpperCase())} placeholder="09DPR1234X" />
      </CampoFormulario>
      <CampoFormulario etiqueta="Nivel educativo" requerido medio>{selector('nivel', NIVELES_EDUCATIVOS)}</CampoFormulario>
      <CampoFormulario etiqueta="Turno" requerido medio>{selector('turno', TURNOS)}</CampoFormulario>
      <CampoFormulario etiqueta="Municipio" requerido medio>
        <CampoTexto value={form.municipio} onChange={(v) => cambiar('municipio', v)} />
      </CampoFormulario>
      <CampoFormulario etiqueta="Teléfono" error={errores.telefono}>
        <CampoTexto tipo="tel" value={form.telefono} onChange={(v) => cambiar('telefono', v)} placeholder="10 dígitos" />
      </CampoFormulario>
      <CampoFormulario etiqueta="Domicilio">
        <CampoTexto value={form.domicilio} onChange={(v) => cambiar('domicilio', v)} placeholder="Calle, número y colonia" />
      </CampoFormulario>
    </MarcoFormulario>
  );
}
