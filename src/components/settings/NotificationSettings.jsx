import React, { useState, useEffect } from 'react';
import styles from './SettingsSection.module.css';
import ToggleSwitch from './ToggleSwitch';

export default function NotificationSettings({ defaultPrefs, onSave }) {
  const [prefs, setPrefs] = useState(defaultPrefs);

  useEffect(() => {
    const saved = localStorage.getItem('lotnis_notification_prefs');
    if (saved) {
      setPrefs(JSON.parse(saved));
    }
  }, []);

  const handleEmailChange = (key, value) => {
    setPrefs((prev) => ({
      ...prev,
      email: { ...prev.email, [key]: value },
    }));
  };

  const handleDashboardChange = (key, value) => {
    setPrefs((prev) => ({
      ...prev,
      dashboard: { ...prev.dashboard, [key]: value },
    }));
  };

  const handleSave = () => {
    localStorage.setItem('lotnis_notification_prefs', JSON.stringify(prefs));
    onSave && onSave('Notification preferences updated');
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Notification Settings</h2>
        <p className={styles.subtitle}>Choose what you want to be notified about and how.</p>
      </div>

      <div className={styles.content}>
        <h3 className={styles.groupTitle}>Email Notifications</h3>
        <ToggleSwitch
          label="New Booking Alerts"
          checked={prefs.email.newBookings}
          onChange={(val) => handleEmailChange('newBookings', val)}
        />
        <ToggleSwitch
          label="New User Registrations"
          checked={prefs.email.newRegistrations}
          onChange={(val) => handleEmailChange('newRegistrations', val)}
        />
        <ToggleSwitch
          label="New Listing Submissions"
          checked={prefs.email.newListings}
          onChange={(val) => handleEmailChange('newListings', val)}
        />
        <ToggleSwitch
          label="Reports & Complaints"
          description="Get notified immediately when a critical report is filed."
          checked={prefs.email.reportsAndComplaints}
          onChange={(val) => handleEmailChange('reportsAndComplaints', val)}
        />

        <h3 className={styles.groupTitle} style={{ marginTop: 'var(--spacing-6)' }}>
          Dashboard Alerts
        </h3>
        <ToggleSwitch
          label="System Alerts"
          description="Platform updates, maintenance, and system health."
          checked={prefs.dashboard.systemAlerts}
          onChange={(val) => handleDashboardChange('systemAlerts', val)}
        />
        <ToggleSwitch
          label="Moderation Alerts"
          checked={prefs.dashboard.moderationAlerts}
          onChange={(val) => handleDashboardChange('moderationAlerts', val)}
        />
        <ToggleSwitch
          label="Booking Alerts"
          checked={prefs.dashboard.bookingAlerts}
          onChange={(val) => handleDashboardChange('bookingAlerts', val)}
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
