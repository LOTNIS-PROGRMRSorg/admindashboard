import React, { useState, useEffect } from 'react';
import styles from './SettingsSection.module.css';
import ToggleSwitch from './ToggleSwitch';

export default function DashboardPreferences({ defaultPrefs, onSave }) {
  const [prefs, setPrefs] = useState(defaultPrefs);

  useEffect(() => {
    const saved = localStorage.getItem('lotnis_dashboard_prefs');
    if (saved) {
      setPrefs(JSON.parse(saved));
    }
  }, []);

  const handleChange = (key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('lotnis_dashboard_prefs', JSON.stringify(prefs));
    onSave && onSave('Dashboard preferences saved successfully');
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Dashboard Preferences</h2>
        <p className={styles.subtitle}>Customize your dashboard layout and visible widgets.</p>
      </div>

      <div className={styles.content}>
        <h3 className={styles.groupTitle}>Layout Options</h3>
        <ToggleSwitch
          label="Compact Table Mode"
          description="Reduce spacing in tables to show more data at once."
          checked={prefs.compactTableMode}
          onChange={(val) => handleChange('compactTableMode', val)}
        />
        <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: 'var(--spacing-2) 0' }}></div>
        <ToggleSwitch
          label="Show Analytics Cards"
          description="Display high-level statistics at the top of the dashboard."
          checked={prefs.showAnalyticsCards}
          onChange={(val) => handleChange('showAnalyticsCards', val)}
        />
        <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: 'var(--spacing-2) 0' }}></div>
        <ToggleSwitch
          label="Show Recent Activity"
          description="Display the recent activity feed on the main page."
          checked={prefs.showRecentActivity}
          onChange={(val) => handleChange('showRecentActivity', val)}
        />
        <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: 'var(--spacing-2) 0' }}></div>
        <ToggleSwitch
          label="Show Booking Stats"
          description="Show detailed booking metrics and charts."
          checked={prefs.showBookingStats}
          onChange={(val) => handleChange('showBookingStats', val)}
        />
      </div>

      <div className={styles.footer}>
        <button className={styles.btnPrimary} onClick={handleSave}>
          Save Preferences
        </button>
      </div>
    </div>
  );
}
