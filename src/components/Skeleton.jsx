import '../styles/Skeleton.css';

export default function Skeleton({ children }) {
  return (
    <div className="skeleton">
      {children}
      <div className="skeleton-contenido">
        <i className="skeleton-icono ri-graduation-cap-line" />
        <span className="skeleton-marca">SIGESED</span>
      </div>
    </div>
  );
}
