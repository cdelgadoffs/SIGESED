import { useEffect, useState } from 'react';
import CampoFormulario from '../base/CampoFormulario.jsx';
import CampoTexto from '../base/CampoTexto.jsx';
import ListaExpandible from '../base/ListaExpandible.jsx';
import BotonIcono from '../base/BotonIcono.jsx';
import BotonS from '../base/BotonS.jsx';
import MarcoFormulario from './MarcoFormulario.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { DIAS_SEMANA, diaDeSemana } from '../../utils/fechas.js';
import '../../styles/widgets/FormularioCiclo.css';

function desdeCiclo(ciclo) {
  return {
    fechaInicio: ciclo.fechaInicio ?? '',
    diaInicioSemana: ciclo.diaInicioSemana ?? null,
    vacaciones: (ciclo.vacaciones ?? []).map((v) => ({ inicio: v.inicio, semanas: String(v.semanas) })),
    asuetos: [...(ciclo.asuetos ?? [])],
  };
}

function igual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function Configuracion({ ciclo }) {
  const { configurarCiclo, guardarBorrador, obtenerBorrador, eliminarBorrador } = useRegistros();
  const { cicloEnEdicionId, setCicloEnEdicionId } = useUI();
  const editando = cicloEnEdicionId === ciclo.id;
  const [base] = useState(() => desdeCiclo(ciclo));
  const clave = `configuracionCiclo:${ciclo.id}`;
  const [form, setForm] = useState(base);
  const [restaurado, setRestaurado] = useState(false);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    let cancelado = false;
    obtenerBorrador(clave)
      .catch(() => null)
      .then((borrador) => {
        if (cancelado) return;
        if (borrador) setForm(borrador);
        setRestaurado(true);
      });
    return () => {
      cancelado = true;
    };
  }, [clave, obtenerBorrador]);

  useEffect(() => {
    if (!restaurado) return undefined;
    const temporizador = setTimeout(() => {
      (igual(form, base) ? eliminarBorrador(clave) : guardarBorrador(clave, form)).catch(() => {});
    }, 400);
    return () => clearTimeout(temporizador);
  }, [form, restaurado, base, clave, guardarBorrador, eliminarBorrador]);

  function cambiar(cambios) {
    setForm((f) => ({ ...f, ...cambios }));
    setError(null);
  }

  function cambiarInicio(fecha) {
    const dia = diaDeSemana(fecha);
    cambiar(dia === null ? { fechaInicio: fecha } : { fechaInicio: fecha, diaInicioSemana: dia });
  }

  function cambiarVacacion(i, cambios) {
    cambiar({ vacaciones: form.vacaciones.map((v, j) => (j === i ? { ...v, ...cambios } : v)) });
  }

  function cambiarAsueto(i, fecha) {
    cambiar({ asuetos: form.asuetos.map((a, j) => (j === i ? fecha : a)) });
  }

  const diaNoCoincide = form.fechaInicio && form.diaInicioSemana !== null && diaDeSemana(form.fechaInicio) !== form.diaInicioSemana;
  const vacacionFueraDeDia = form.vacaciones.some((v) => v.inicio && form.diaInicioSemana !== null && diaDeSemana(v.inicio) !== form.diaInicioSemana);
  const incompleto = !form.fechaInicio || form.diaInicioSemana === null
    || form.vacaciones.some((v) => !v.inicio || !(Number(v.semanas) >= 1))
    || form.asuetos.some((a) => !a);
  const puedeGuardar = restaurado && !incompleto && !diaNoCoincide && !vacacionFueraDeDia && !igual(form, base) && !ocupado;

  function cancelar() {
    setForm(base);
    setError(null);
    eliminarBorrador(clave).catch(() => {});
    if (editando) setCicloEnEdicionId(null);
  }

  async function guardar() {
    setOcupado(true);
    setError(null);
    await eliminarBorrador(clave).catch(() => {});
    try {
      await configurarCiclo(ciclo.id, {
        fechaInicio: form.fechaInicio,
        diaInicioSemana: form.diaInicioSemana,
        vacaciones: form.vacaciones.map((v) => ({ inicio: v.inicio, semanas: Number(v.semanas) })),
        asuetos: form.asuetos,
      });
      if (editando) setCicloEnEdicionId(null);
    } catch (e) {
      guardarBorrador(clave, form).catch(() => {});
      setError(e?.mensaje ?? 'No se pudo guardar la configuración.');
      setOcupado(false);
    }
  }

  const nombreDia = form.diaInicioSemana !== null ? DIAS_SEMANA[form.diaInicioSemana].toLowerCase() : 'el día de inicio';

  return (
    <MarcoFormulario
      error={error}
      textoConfirmar="Guardar"
      puedeConfirmar={puedeGuardar}
      onCancelar={cancelar}
      onConfirmar={guardar}
    >
      <div className="widget-formulario-ciclo-fila">
        <CampoFormulario etiqueta="Fecha de inicio (Semana 1)" requerido medio>
          <CampoTexto tipo="date" value={form.fechaInicio} onChange={cambiarInicio} />
        </CampoFormulario>
        <CampoFormulario
          etiqueta="La semana empieza en"
          requerido
          medio
          error={diaNoCoincide ? 'La fecha de inicio debe caer en este día.' : null}
        >
          <ListaExpandible
            valorActual={form.diaInicioSemana}
            etiquetaActual={form.diaInicioSemana !== null ? DIAS_SEMANA[form.diaInicioSemana] : 'Selecciona…'}
            opciones={DIAS_SEMANA.map((d, i) => ({ id: i, label: d }))}
            onSeleccionar={(i) => cambiar({ diaInicioSemana: i })}
          />
        </CampoFormulario>
      </div>

      <CampoFormulario
        etiqueta="Periodos vacacionales (semanas completas)"
        error={vacacionFueraDeDia ? `Cada periodo debe empezar en ${nombreDia}, al inicio de una semana.` : null}
      >
        <div className="widget-formulario-ciclo-lista">
          {form.vacaciones.map((v, i) => (
            <div key={i} className="widget-formulario-ciclo-renglon">
              <CampoTexto tipo="date" value={v.inicio} onChange={(f) => cambiarVacacion(i, { inicio: f })} ariaLabel="Inicio del periodo vacacional" />
              <div className="widget-formulario-ciclo-semanas">
                <CampoTexto tipo="number" value={v.semanas} onChange={(n) => cambiarVacacion(i, { semanas: n })} ariaLabel="Semanas de vacaciones" />
              </div>
              <span className="widget-formulario-ciclo-unidad">{Number(v.semanas) === 1 ? 'semana' : 'semanas'}</span>
              <BotonIcono icono="ri-delete-bin-line" ariaLabel="Quitar periodo vacacional" onClick={() => cambiar({ vacaciones: form.vacaciones.filter((_, j) => j !== i) })} />
            </div>
          ))}
          <div>
            <BotonS variant="claro" onClick={() => cambiar({ vacaciones: [...form.vacaciones, { inicio: '', semanas: '1' }] })}>Añadir periodo vacacional</BotonS>
          </div>
        </div>
      </CampoFormulario>

      <CampoFormulario etiqueta="Días de asueto">
        <div className="widget-formulario-ciclo-lista">
          {form.asuetos.map((a, i) => (
            <div key={i} className="widget-formulario-ciclo-renglon">
              <CampoTexto tipo="date" value={a} onChange={(f) => cambiarAsueto(i, f)} ariaLabel="Día de asueto" />
              <BotonIcono icono="ri-delete-bin-line" ariaLabel="Quitar día de asueto" onClick={() => cambiar({ asuetos: form.asuetos.filter((_, j) => j !== i) })} />
            </div>
          ))}
          <div>
            <BotonS variant="claro" onClick={() => cambiar({ asuetos: [...form.asuetos, ''] })}>Añadir día de asueto</BotonS>
          </div>
        </div>
      </CampoFormulario>

    </MarcoFormulario>
  );
}

export default function FormularioCiclo() {
  const { CICLOS, cicloActivoId } = useRegistros();
  const ciclo = CICLOS.find((c) => c.id === cicloActivoId);
  if (!ciclo) return null;
  const abierto = CICLOS.find((c) => c.id !== ciclo.id && c.fechaInicio && !c.cerrado
    && (c.anio < ciclo.anio || (c.anio === ciclo.anio && c.numero < ciclo.numero)));
  if (ciclo.cerrado || abierto) {
    return (
      <p className="widget-formulario-ciclo-aviso">
        {ciclo.cerrado
          ? `El ciclo ${ciclo.id} ya se concluyó y no se puede modificar.`
          : `Primero concluye el ciclo ${abierto.id} (Panel de control › Calendarización anual) para poder configurar el ${ciclo.id}.`}
      </p>
    );
  }
  return <Configuracion key={`${ciclo.id}:${ciclo.version}`} ciclo={ciclo} />;
}
