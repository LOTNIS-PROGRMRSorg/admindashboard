import { useId } from 'react';
import styles from './FormInput.module.css';

export default function FormInput({ label, type = 'text', value, onChange, placeholder, disabled, hint }) {
  const inputId = useId();
  return (
    <div className={styles.container}>
      {label && <label className={styles.label} htmlFor={inputId}>{label}</label>}
      <input 
        id={inputId}
        type={type} 
        className={`${styles.input} ${disabled ? styles.disabled : ''}`} 
        value={value} 
        onChange={(e) => onChange && onChange(e.target.value)} 
        placeholder={placeholder}
        disabled={disabled}
      />
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
