import '../../styles/base/Checkbox.css';

export default function Checkbox({ checked, onChange, label, disabled }) {
  return (
    <label className={'base-checkbox' + (disabled ? ' base-checkbox-disabled' : '')}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.checked)}
      />
      {label && <span className="base-checkbox-label">{label}</span>}
    </label>
  );
}
