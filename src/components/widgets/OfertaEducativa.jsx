import SeccionSitio from '../base/SeccionSitio.jsx';
import TarjetaSitio from '../base/TarjetaSitio.jsx';
import BadgeDinamico from '../base/BadgeDinamico.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';

export default function OfertaEducativa({ titulo, descripcion, fondo }) {
  const { PROGRAMAS_EDUCATIVOS, MODALIDADES, MATERIAS } = useRegistros();
  return (
    <SeccionSitio titulo={titulo} descripcion={descripcion} fondo={fondo} columnas={Math.max(1, Math.min(3, PROGRAMAS_EDUCATIVOS.length))}>
      {PROGRAMAS_EDUCATIVOS.map((p) => {
        const materias = MATERIAS.filter((m) => m.programaEducativo === p.id).length;
        return (
          <TarjetaSitio
            key={p.id}
            icono="ri-graduation-cap-line"
            titulo={p.nombre}
            texto={materias > 0 ? `${materias} materias en su plan de estudios.` : 'Plan de estudios en preparación.'}
          >
            {MODALIDADES.map((m) => <BadgeDinamico key={m.id} texto={m.nombre} tono="azul" />)}
          </TarjetaSitio>
        );
      })}
    </SeccionSitio>
  );
}
