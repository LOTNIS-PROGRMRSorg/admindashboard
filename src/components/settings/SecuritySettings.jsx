import styles from './SettingsSection.module.css';

export default function SecuritySettings() {
  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Security</h2>
        <p className={styles.subtitle}>Security controls require a connected account service.</p>
      </div>
      <div className={styles.content}>
        <div className={styles.prototypeNotice} style={{ margin: 0 }}>
          Password changes, two-factor authentication, and session management are unavailable in this frontend prototype. No password or security setting will be collected or changed here.
        </div>
      </div>
    </div>
  );
}
