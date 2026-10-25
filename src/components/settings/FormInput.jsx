import React from 'react';
import styles from './FormInput.module.css';

export default function FormInput({ label, type = 'text', value, onChange, placeholder, disabled, hint }) {
  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      <input
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
