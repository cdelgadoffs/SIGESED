import { useScrollbarPersonalizada } from '../../hooks/useScrollbarPersonalizada.js';
import '../../styles/base/Scrollbar.css';

export default function Scrollbar({ children }) {
  const { contenedorRef, thumb, onScroll, onArrastrarThumb } = useScrollbarPersonalizada();
  return (
    <div className="base-scrollbar-wrap">
      <div className="base-scrollbar" ref={contenedorRef} onScroll={onScroll}>
        {children}
      </div>
      {thumb.visible && (
        <div
          className="base-scrollbar-thumb"
          style={{ height: thumb.alto, top: thumb.top }}
          onMouseDown={onArrastrarThumb}
        />
      )}
    </div>
  );
}
