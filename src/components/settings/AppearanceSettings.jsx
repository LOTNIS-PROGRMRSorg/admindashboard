import { Check, Monitor, Moon, Sun } from 'lucide-react';
import styles from './SettingsSection.module.css';
import { useTheme } from '../../context/useTheme';

const options = [
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'dark', label: 'Dark', Icon: Moon },
  { id: 'system', label: 'Use device setting', Icon: Monitor },
];

export default function AppearanceSettings({ onSave }) {
  const { preference, setPreference } = useTheme();

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Appearance</h2>
        <p className={styles.subtitle}>Choose how Lotnis Admin looks in this browser. Your choice applies across every page.</p>
      </div>
      <div className={styles.content}>
        <h3 className={styles.groupTitle}>Color theme</h3>
        <div className={styles.themeGrid}>
          {options.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={`${styles.themeCard} ${preference === id ? styles.active : ''}`}
              onClick={() => {
                setPreference(id);
                onSave?.(`${label} theme applied and saved in this browser`);
              }}
              aria-pressed={preference === id}
            >
              <span className={styles.themeIcon}><Icon size={22} aria-hidden="true" /></span>
              <span className={styles.themeLabel}>{label}</span>
              {preference === id && <span className={styles.selectedLabel}><Check size={14} /> Selected</span>}
            </button>
          ))}
        </div>
        <p className={styles.preferenceNote}>Theme preference is stored locally in this browser. Use device setting follows your operating system preference.</p>
      </div>
    </div>
  );
}
