import BotonSeleccionableMenu from '../base/BotonSeleccionableMenu.jsx';
import SubMenuDD from './SubMenuDD.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import '../../styles/widgets/MenuPrincipal.css';

const ITEMS_MENU_PRINCIPAL = [
  { id: 'inicio', label: 'Inicio', icono: 'ri-home-4-line', destacado: true },
  { id: 'asistencia', label: 'Asistencia general', icono: 'ri-calendar-check-line' },
  { id: 'bitacora', label: 'Bitácora estudiantil', icono: 'ri-draft-line' },
  { id: 'horarios', label: 'Control de horarios', icono: 'ri-time-line' },
  { id: 'cursos', label: 'Cursos extracurriculares', icono: 'ri-award-line' },
  { id: 'kardex', label: 'Kárdex académico', icono: 'ri-file-user-line' },
  {
    id: 'registros',
    label: 'Matrícula',
    icono: 'ri-team-line',
    hijos: [
      { id: 'grupos', nombre: 'Grupos', lista: 'GRUPOS' },
      { id: 'personal', nombre: 'Personal administrativo', lista: 'PERSONAL' },
      { id: 'estudiantes', nombre: 'Estudiantes', lista: 'ESTUDIANTES' },
    ],
  },
  { id: 'planEstudios', label: 'Plan de estudios', icono: 'ri-book-open-line' },
  { id: 'planTrabajo', label: 'Plan de trabajo', icono: 'ri-task-line' },
  { id: 'evaluaciones', label: 'Registro de evaluaciones', icono: 'ri-file-edit-line' },
];

export default function MenuPrincipal() {
  const registros = useRegistros();
  const { vistaActual, setVistaActual, abrirNuevoRegistro, registrosAbierto, setRegistrosAbierto } = useUI();

  function irA(vista) {
    setVistaActual(vista);
    setRegistrosAbierto(false);
  }

  function alternarGrupo(item, activo) {
    if (!activo) {
      setVistaActual(item.hijos[0].id);
      setRegistrosAbierto(true);
      return;
    }
    setRegistrosAbierto((a) => !a);
  }

  function agregar(vista) {
    setVistaActual(vista);
    abrirNuevoRegistro();
  }

  return (
    <div className="widget-menu-principal">
      {ITEMS_MENU_PRINCIPAL.map((item) => {
        if (!item.hijos) {
          return (
            <div key={item.id} className={item.destacado ? 'widget-menu-principal-destacado' : undefined}>
              <BotonSeleccionableMenu icono={item.icono} activo={vistaActual === item.id} onClick={() => irA(item.id)}>
                {item.label}
              </BotonSeleccionableMenu>
            </div>
          );
        }
        const activo = item.hijos.some((h) => h.id === vistaActual);
        return (
          <div key={item.id}>
            <BotonSeleccionableMenu
              icono={item.icono}
              activo={activo}
              expandible
              expandido={registrosAbierto}
              onClick={() => alternarGrupo(item, activo)}
            >
              {item.label}
            </BotonSeleccionableMenu>
            {registrosAbierto && (
              <SubMenuDD
                items={item.hijos.map((h) => ({ id: h.id, nombre: h.nombre, badge: registros[h.lista].length }))}
                activoId={vistaActual}
                onSeleccionar={setVistaActual}
                onAgregar={agregar}
                iconoAgregar="+"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
