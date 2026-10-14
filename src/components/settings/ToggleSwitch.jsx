import { useId } from 'react';
import styles from './ToggleSwitch.module.css';

export default function ToggleSwitch({ checked, onChange, label, description }) {
  const inputId = useId();
  return (
    <label className={styles.container} htmlFor={inputId}>
      <div className={styles.textContainer}>
        {label && <span className={styles.label}>{label}</span>}
        {description && <span className={styles.description}>{description}</span>}
      </div>
      <div className={`${styles.switch} ${checked ? styles.checked : ''}`}>
        <input 
          id={inputId}
          type="checkbox" 
          className={styles.input} 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)} 
        />
        <span className={styles.slider}></span>
      </div>
    </label>
  );
}
