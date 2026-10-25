import React from 'react';
import styles from './SettingsSection.module.css';

export default function AccountSettings({ profile }) {
  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Account Settings</h2>
        <p className={styles.subtitle}>View your account details and current status.</p>
      </div>

      <div className={styles.content}>
        <h3 className={styles.groupTitle}>Account Information</h3>
        <div className={styles.formGrid}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Administrator Role</span>
            <p style={{ margin: '0.25rem 0 1rem 0', fontWeight: 500 }}>{profile.role}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Account Status</span>
            <p style={{ margin: '0.25rem 0 1rem 0', fontWeight: 500, color: 'var(--color-success)' }}>{profile.status}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Creation Date</span>
            <p style={{ margin: '0.25rem 0 1rem 0', fontWeight: 500 }}>{new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Last Login</span>
            <p style={{ margin: '0.25rem 0 1rem 0', fontWeight: 500 }}>{new Date(profile.lastLogin).toLocaleString()}</p>
          </div>
        </div>

        <h3 className={styles.groupTitle} style={{ marginTop: 'var(--spacing-4)' }}>Danger Zone</h3>
        <div style={{ padding: 'var(--spacing-4)', border: '1px solid var(--color-danger-line)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-danger-bg)' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-danger)', fontSize: '0.875rem' }}>Deactivate Account</h4>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--color-danger-ink)' }}>Once you deactivate your account, you will lose access to the dashboard. This action requires super-admin approval.</p>
          <button className={styles.btnSecondary} style={{ borderColor: 'var(--color-danger-line)', color: 'var(--color-danger)' }}>Request Deactivation</button>
        </div>
      </div>
    </div>
  );
}
