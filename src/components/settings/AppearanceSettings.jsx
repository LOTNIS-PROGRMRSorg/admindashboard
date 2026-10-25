import React, { useState, useEffect } from 'react';
import styles from './SettingsSection.module.css';

export default function AppearanceSettings({ onSave }) {
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    // Load preference
    const savedTheme = localStorage.getItem('lotnis_theme_preference') || 'system';
    setTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('lotnis_theme_preference', newTheme);

    if (newTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  const handleSave = () => {
    onSave && onSave('Appearance settings saved successfully');
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Appearance</h2>
        <p className={styles.subtitle}>Customize how the dashboard looks on your device.</p>
      </div>

      <div className={styles.content}>
        <h3 className={styles.groupTitle}>Theme Preference</h3>
        <div className={styles.themeGrid}>
          <button
            className={`${styles.themeCard} ${theme === 'light' ? styles.active : ''}`}
            onClick={() => applyTheme('light')}
          >
            <div className={`${styles.themePreview} ${styles.previewLight}`}>
              <div className={styles.previewHeader}></div>
              <div className={styles.previewBody}>
                <div className={styles.previewSidebar}></div>
                <div className={styles.previewContent}></div>
              </div>
            </div>
            <span className={styles.themeLabel}>Light Mode</span>
          </button>

          <button
            className={`${styles.themeCard} ${theme === 'dark' ? styles.active : ''}`}
            onClick={() => applyTheme('dark')}
          >
            <div className={`${styles.themePreview} ${styles.previewDark}`}>
              <div className={styles.previewHeader}></div>
              <div className={styles.previewBody}>
                <div className={styles.previewSidebar}></div>
                <div className={styles.previewContent}></div>
              </div>
            </div>
            <span className={styles.themeLabel}>Dark Mode</span>
          </button>

          <button
            className={`${styles.themeCard} ${theme === 'system' ? styles.active : ''}`}
            onClick={() => applyTheme('system')}
          >
            <div className={`${styles.themePreview} ${styles.previewSystem}`}>
              <span style={{ fontSize: '2rem' }}>💻</span>
            </div>
            <span className={styles.themeLabel}>System Preference</span>
          </button>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.btnPrimary} onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
