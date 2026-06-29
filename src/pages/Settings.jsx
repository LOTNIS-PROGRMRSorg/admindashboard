import React, { useState, useEffect } from 'react';
import styles from './Settings.module.css';
import pageStyles from './Page.module.css';

// Components
import SettingsSidebar from '../components/settings/SettingsSidebar';
import ProfileSettings from '../components/settings/ProfileSettings';
import AccountSettings from '../components/settings/AccountSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import DashboardPreferences from '../components/settings/DashboardPreferences';
import NotificationSettings from '../components/settings/NotificationSettings';
import SecuritySettings from '../components/settings/SecuritySettings';

// Mock Data
import { adminProfile, defaultPreferences } from '../data/settingsData';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [toastMessage, setToastMessage] = useState('');

  // Initial theme loader just to ensure the settings page acts correctly
  useEffect(() => {
    const savedTheme = localStorage.getItem('lotnis_theme_preference');
    if (savedTheme && savedTheme !== 'system') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (savedTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
  }, []);

  const handleSaveNotification = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings profile={adminProfile} onSave={handleSaveNotification} />;
      case 'account':
        return <AccountSettings profile={adminProfile} />;
      case 'appearance':
        return <AppearanceSettings onSave={handleSaveNotification} />;
      case 'dashboard':
        return <DashboardPreferences defaultPrefs={defaultPreferences.dashboard} onSave={handleSaveNotification} />;
      case 'notifications':
        return <NotificationSettings defaultPrefs={defaultPreferences.notifications} onSave={handleSaveNotification} />;
      case 'security':
        return <SecuritySettings onSave={handleSaveNotification} />;
      default:
        return <ProfileSettings profile={adminProfile} onSave={handleSaveNotification} />;
    }
  };

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.header}>
        <div>
          <h1 className={pageStyles.title}>Settings & Preferences</h1>
          <p className={pageStyles.subtitle} style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Manage your account, dashboard preferences, and platform configuration.
          </p>
        </div>
      </div>
      
      <div className={styles.layout}>
        <aside className={styles.sidebarColumn}>
          <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>
        
        <main className={styles.contentColumn}>
          {renderActiveSection()}
        </main>
      </div>

      {toastMessage && (
        <div className={styles.toast}>
          <span className={styles.toastIcon}>✅</span>
          <span className={styles.toastText}>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
