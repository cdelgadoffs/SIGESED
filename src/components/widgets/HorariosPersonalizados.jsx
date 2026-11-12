import { useState } from 'react';
import BotonS from '../base/BotonS.jsx';
import BotonIcono from '../base/BotonIcono.jsx';
import Modal from '../base/Modal.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { esAdministradorTI } from '../../utils/permisos.js';
import { personalizadasDe, tramosHorario, tipoHorario } from '../../utils/inscripciones.js';
import { nombreCompleto } from '../../utils/registros.js';
import '../../styles/widgets/HorariosPersonalizados.css';

export default function HorariosPersonalizados({ grupo }) {
  const { CICLOS, cicloActivoId, INSCRIPCIONES, MATERIAS, PERSONAL, ESTUDIANTES, MODALIDADES, HORAS_CLASE, eliminarHorarioPersonalizado, guardarHorarioPersonalizado } = useRegistros();
  const { abrirHorarioPersonalizado } = useUI();
  const { puede, rolesSesion, rolActivo } = useAuth();
  const [porEliminar, setPorEliminar] = useState(null);
  const [porQuitar, setPorQuitar] = useState(null);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const ciclo = CICLOS.find((c) => c.id === cicloActivoId);
  if (!ciclo) return null;
  const editable = puede('inicio', 'editar') && (!ciclo.cerrado || esAdministradorTI(rolesSesion.filter(rolActivo)));
  const lista = personalizadasDe(INSCRIPCIONES, ciclo.id, grupo.id);
  if (lista.length === 0) return null;
  const tipo = tipoHorario(grupo, MODALIDADES);

  function cerrar() {
    setPorEliminar(null);
    setPorQuitar(null);
    setError(null);
  }

  async function eliminar() {
    setOcupado(true);
    setError(null);
    try {
      await eliminarHorarioPersonalizado(porEliminar.id);
      cerrar();
    } catch (e) {
      setError(e?.mensaje ?? 'No se pudo eliminar el horario personalizado.');
    } finally {
      setOcupado(false);
    }
  }

  async function quitar() {
    setOcupado(true);
    setError(null);
    const { horario, materia } = porQuitar;
    try {
      await guardarHorarioPersonalizado(ciclo.id, grupo.id, horario.id, {
        materias: horario.materias.filter((m) => m.materia !== materia.materia),
        estudiantes: horario.estudiantes ?? [],
      });
      cerrar();
    } catch (e) {
      setError(e?.mensaje ?? 'No se pudo quitar la materia.');
    } finally {
      setOcupado(false);
    }
  }

  const materiaPorQuitar = porQuitar && MATERIAS.find((x) => x.id === porQuitar.materia.materia);

  return (
    <div className="widget-horarios-personalizados">
      {lista.map((p, n) => {
        const alumnos = (p.estudiantes ?? []).map((id) => ESTUDIANTES.find((e) => e.id === id)).filter(Boolean);
        return (
          <div key={p.id} className="widget-horarios-personalizados-item">
            <div className="widget-horarios-personalizados-encabezado">
              <i className="ri-user-settings-line" />
              <span className="widget-horarios-personalizados-titulo">{`Horario personalizado ${lista.length > 1 ? n + 1 : ''}`.trim()}</span>
              <span className="widget-horarios-personalizados-alumnos">{`${alumnos.length} ${alumnos.length === 1 ? 'alumno' : 'alumnos'}: ${alumnos.map(nombreCompleto).join(', ')}`}</span>
              {editable && (
                <>
                  <BotonIcono icono="ri-pencil-line" ariaLabel="Editar horario personalizado" onClick={() => abrirHorarioPersonalizado(grupo.id, p.id)} />
                  <BotonIcono icono="ri-delete-bin-line" ariaLabel="Eliminar horario personalizado" onClick={() => setPorEliminar(p)} />
                </>
              )}
            </div>
            {p.materias.map((m) => {
              const materia = MATERIAS.find((x) => x.id === m.materia);
              const docente = PERSONAL.find((x) => x.id === m.docenteId);
              return (
                <div key={m.materia} className="widget-horarios-personalizados-materia">
                  <span className="widget-horarios-personalizados-materia-nombre">{materia ? `${materia.clave} · ${materia.nombre}` : m.materia}</span>
                  <span>{docente ? nombreCompleto(docente) : 'Sin docente'}</span>
                  <span className="widget-horarios-personalizados-celda">
                  <span className="widget-horarios-personalizados-horario">
                    {tipo === null ? 'Sin horario (Online)' : m.horario.length === 0 ? 'Sin horario' : tramosHorario(m.horario, HORAS_CLASE).map((t, k) => (
                      <span key={k} className={`widget-horarios-personalizados-dia widget-horarios-personalizados-dia-${t.dia}`}>{t.texto}</span>
                    ))}
                  </span>
                  {editable && p.materias.length > 1
                    ? <span className="widget-horarios-personalizados-quitar"><BotonIcono icono="ri-close-line" ariaLabel="Quitar materia" onClick={() => setPorQuitar({ horario: p, materia: m })} /></span>
                    : null}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
      <Modal abierto={porQuitar !== null} titulo="Quitar materia" onCerrar={cerrar}>
        <p className="widget-horarios-personalizados-modal-texto">
          {`¿Quitar ${materiaPorQuitar ? `${materiaPorQuitar.clave} · ${materiaPorQuitar.nombre}` : 'esta materia'} de este horario personalizado? Sus alumnos dejarán de cursarla en este ciclo.`}
        </p>
        {error && <p className="widget-horarios-personalizados-modal-error">{error}</p>}
        <div className="widget-horarios-personalizados-modal-acciones">
          <BotonS variant="claro" onClick={cerrar}>Cancelar</BotonS>
          <BotonS variant="claro" disabled={ocupado} onClick={quitar}>Quitar</BotonS>
        </div>
      </Modal>
      <Modal abierto={porEliminar !== null} titulo="Eliminar horario personalizado" onCerrar={cerrar}>
        <p className="widget-horarios-personalizados-modal-texto">
          ¿Eliminar este horario personalizado? Sus alumnos volverán a tomar las materias del grupo y las calificaciones capturadas de materias que el grupo no tiene dejarán de mostrarse en su boleta.
        </p>
        {error && <p className="widget-horarios-personalizados-modal-error">{error}</p>}
        <div className="widget-horarios-personalizados-modal-acciones">
          <BotonS variant="claro" onClick={cerrar}>Cancelar</BotonS>
          <BotonS variant="claro" disabled={ocupado} onClick={eliminar}>Eliminar</BotonS>
        </div>
      </Modal>
    </div>
  );
}
