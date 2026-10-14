import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
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
            Manage browser preferences and review the prototype account settings.
          </p>
        </div>
      </div>

      <p className={styles.prototypeNotice}>
        This frontend prototype has no connected account or platform service. Only appearance and preference choices are saved locally in this browser.
      </p>
      
      <div className={styles.layout}>
        <aside className={styles.sidebarColumn}>
          <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>
        
        <main className={styles.contentColumn}>
          {renderActiveSection()}
        </main>
      </div>

      {toastMessage && (
        <div className={styles.toast} role="status" aria-live="polite">
          <CheckCircle2 className={styles.toastIcon} size={18} aria-hidden="true" />
          <span className={styles.toastText}>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
