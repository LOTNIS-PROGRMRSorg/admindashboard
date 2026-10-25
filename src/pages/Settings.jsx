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
import { apiFetch } from '../lib/api';

// Fallback shape while the real profile is loading.
import { defaultPreferences } from '../data/settingsData';

const emptyProfile = {
  name: '',
  username: '',
  email: '',
  phone: '',
  role: '',
  avatar: 'https://i.pravatar.cc/150?u=lotnis',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  status: 'Active',
};

function mapBackendProfile(data) {
  const name = [data.first_name, data.last_name].filter(Boolean).join(' ');
  return {
    name,
    username: data.email ? data.email.split('@')[0] : '',
    email: data.email || '',
    phone: data.phone || '',
    role: data.dashboard_role ? data.dashboard_role.charAt(0).toUpperCase() + data.dashboard_role.slice(1) : 'Manager',
    avatar: data.avatar_url || `https://i.pravatar.cc/150?u=${data.email || data.id}`,
    createdAt: data.created_at,
    lastLogin: data.member_since || data.created_at,
    status: 'Active',
  };
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [toastMessage, setToastMessage] = useState('');
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

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

  // Load the real signed-in admin's profile from the backend.
  useEffect(() => {
    let cancelled = false;
    apiFetch('/admin/access/profile')
      .then((data) => {
        if (!cancelled) setProfile(mapBackendProfile(data));
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveNotification = async (value) => {
    if (typeof value === 'object' && value.name !== undefined) {
      const updated = await apiFetch('/admin/access/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          firstName: value.name.split(' ')[0],
          lastName: value.name.split(' ').slice(1).join(' '),
          phone: value.phone,
        }),
      });
      setProfile((current) => ({ ...current, ...mapBackendProfile(updated) }));
    } else if (typeof value === 'object') {
      setProfile((current) => ({ ...current, ...value }));
    }
    setToastMessage(typeof value === 'string' ? value : 'Profile settings saved successfully');
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const renderActiveSection = () => {
    if (loading) {
      return <p className={pageStyles.subtitle}>Loading your profile…</p>;
    }
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings profile={profile} onSave={handleSaveNotification} />;
      case 'account':
        return <AccountSettings profile={profile} />;
      case 'appearance':
        return <AppearanceSettings onSave={handleSaveNotification} />;
      case 'dashboard':
        return <DashboardPreferences defaultPrefs={defaultPreferences.dashboard} onSave={handleSaveNotification} />;
      case 'notifications':
        return <NotificationSettings defaultPrefs={defaultPreferences.notifications} onSave={handleSaveNotification} />;
      case 'security':
        return <SecuritySettings onSave={handleSaveNotification} />;
      default:
        return <ProfileSettings profile={profile} onSave={handleSaveNotification} />;
    }
  };

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.header}>
        <div>
          <h1 className={pageStyles.title}>Settings & Preferences</h1>
          <p
            className={pageStyles.subtitle}
            style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}
          >
            Manage your account, dashboard preferences, and platform configuration.
          </p>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebarColumn}>
          <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>

        <main className={styles.contentColumn}>{renderActiveSection()}</main>
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
