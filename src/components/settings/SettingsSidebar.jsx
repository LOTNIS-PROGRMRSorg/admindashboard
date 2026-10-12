import React from 'react';
import styles from './SettingsSidebar.module.css';

const TABS = [
  { id: 'profile', label: 'Profile Settings', icon: '👤' },
  { id: 'account', label: 'Account Settings', icon: '⚙️' },
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'dashboard', label: 'Dashboard Preferences', icon: '📊' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'security', label: 'Security', icon: '🔒' }
];

export default function SettingsSidebar({ activeTab, onTabChange }) {
  return (
    <div className={styles.sidebar}>
      <nav className={styles.nav}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className={styles.icon}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
