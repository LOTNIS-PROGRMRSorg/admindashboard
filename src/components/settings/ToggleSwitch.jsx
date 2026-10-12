import styles from './ToggleSwitch.module.css';

export default function ToggleSwitch({ checked, onChange, label, description, disabled }) {
  return (
    <label className={styles.container}>
      <div className={styles.textContainer}>
        {label && <span className={styles.label}>{label}</span>}
        {description && <span className={styles.description}>{description}</span>}
      </div>
      <div className={`${styles.switch} ${checked ? styles.checked : ''}`}>
        <input 
          type="checkbox" 
          className={styles.input} 
          checked={checked} 
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)} 
        />
        <span className={styles.slider}></span>
      </div>
    </label>
  );
}
