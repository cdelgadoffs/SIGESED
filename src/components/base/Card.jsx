import '../../styles/base/Card.css';

export default function Card({ onClick, children }) {
  return (
    <div className={'base-card' + (onClick ? ' base-card-clickable' : '')} onClick={onClick}>
      {children}
    </div>
  );
}
