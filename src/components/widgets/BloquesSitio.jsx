import PortadaSitio from '../base/PortadaSitio.jsx';
import SeccionSitio from '../base/SeccionSitio.jsx';
import TarjetaSitio from '../base/TarjetaSitio.jsx';
import BotonS from '../base/BotonS.jsx';
import OfertaEducativa from './OfertaEducativa.jsx';
import { useRegistros } from '../../context/RegistrosContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import { PAGINAS_SITIO } from '../../utils/sitio.js';
import '../../styles/widgets/BloquesSitio.css';

export default function BloquesSitio({ pagina }) {
  const { PLANTEL } = useRegistros();
  const { setVistaActual } = useUI();
  const definicion = PAGINAS_SITIO[pagina];
  const institucion = PLANTEL?.institucion || 'Instituto';
  useTituloPagina(`${definicion.titulo} · ${institucion}`, definicion.descripcion);

  return definicion.bloques.map((b, i) => {
    if (b.tipo === 'portada') {
      return (
        <PortadaSitio key={i} etiqueta={b.etiqueta} titulo={b.titulo ?? institucion} subtitulo={b.subtitulo} icono={b.icono} compacta={b.compacta}>
          {b.acciones?.map((a) => (
            <span key={a.destino} className={'widget-bloques-sitio-accion' + (a.principal ? ' widget-bloques-sitio-accion-principal' : '')}>
              <BotonS variant="claro" onClick={() => setVistaActual(a.destino)}>{a.texto}</BotonS>
            </span>
          ))}
        </PortadaSitio>
      );
    }
    if (b.tipo === 'oferta') {
      return <OfertaEducativa key={i} titulo={b.titulo} descripcion={b.descripcion} fondo={b.fondo} />;
    }
    return (
      <SeccionSitio key={i} titulo={b.titulo} descripcion={b.descripcion} fondo={b.fondo} columnas={b.columnas ?? Math.min(3, b.tarjetas.length)}>
        {b.tarjetas.map((t, j) => {
          const tarjeta = <TarjetaSitio icono={t.icono} titulo={t.titulo} texto={t.texto} detalle={t.detalle} numero={b.numerada ? j + 1 : undefined} />;
          return t.destino ? (
            <button key={j} type="button" className="widget-bloques-sitio-enlace" onClick={() => setVistaActual(t.destino)}>{tarjeta}</button>
          ) : <div key={j} className="widget-bloques-sitio-celda">{tarjeta}</div>;
        })}
      </SeccionSitio>
    );
  });
}
