import React, { useState } from 'react';
import styles from './SettingsSection.module.css';
import FormInput from './FormInput';
import ToggleSwitch from './ToggleSwitch';

export default function SecuritySettings({ onSave }) {
  const [twoFactor, setTwoFactor] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handlePasswordChange = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (passwords.new !== passwords.confirm) {
      alert("New passwords don't match.");
      return;
    }
    onSave && onSave('Security settings saved successfully');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Security</h2>
        <p className={styles.subtitle}>Manage your password and secure your account.</p>
      </div>

      <div className={styles.content}>
        <h3 className={styles.groupTitle}>Two-Factor Authentication</h3>
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <ToggleSwitch
            label="Enable Two-Factor Authentication (2FA)"
            description="Add an extra layer of security to your account using an authenticator app."
            checked={twoFactor}
            onChange={setTwoFactor}
          />
        </div>

        <h3 className={styles.groupTitle}>Change Password</h3>
        <div className={styles.formGrid}>
          <div style={{ gridColumn: '1 / -1' }}>
            <FormInput
              label="Current Password"
              type="password"
              value={passwords.current}
              onChange={(val) => handlePasswordChange('current', val)}
            />
          </div>
          <FormInput
            label="New Password"
            type="password"
            value={passwords.new}
            onChange={(val) => handlePasswordChange('new', val)}
            hint="Minimum 8 characters, at least one uppercase letter, one number and one special character."
          />
          <FormInput
            label="Confirm New Password"
            type="password"
            value={passwords.confirm}
            onChange={(val) => handlePasswordChange('confirm', val)}
          />
        </div>

        <h3 className={styles.groupTitle} style={{ marginTop: 'var(--spacing-4)' }}>
          Active Sessions
        </h3>
        <div
          style={{
            padding: 'var(--spacing-4)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontWeight: 500, fontSize: '0.875rem' }}>MacBook Pro (macOS)</p>
              <p style={{ margin: '0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Chrome - IP: 192.168.1.45 - Active Now
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>Current Session</span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.btnPrimary} onClick={handleSave}>
          Update Password
        </button>
      </div>
    </div>
  );
}
