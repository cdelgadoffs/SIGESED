import '../styles/Skeleton.css';

export default function Skeleton({ children }) {
  return (
    <div className="skeleton">
      {children}
      <div className="skeleton-contenido">
        <span className="skeleton-version">v.0</span>
      </div>
    </div>
  );
}
