import styles from './SettingsSection.module.css';
import FormInput from './FormInput';

export default function ProfileSettings({ profile }) {
  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Profile Settings</h2>
        <p className={styles.subtitle}>Review the sample administrator profile shown in this prototype.</p>
      </div>
      <p className={styles.prototypeNotice}>Profile editing and avatar uploads are unavailable because no account service is connected.</p>
      <div className={styles.content}>
        <div className={styles.avatarSection}>
          <img src={profile.avatar} alt="Sample administrator" className={styles.avatar} />
          <div><p className={styles.subtitle}>Sample administrator profile</p></div>
        </div>
        <h3 className={styles.groupTitle}>Profile information</h3>
        <div className={styles.formGrid}>
          <FormInput label="Full Name" value={profile.name} disabled />
          <FormInput label="Username" value={profile.username} disabled />
          <FormInput label="Email Address" type="email" value={profile.email} disabled />
          <FormInput label="Phone Number" type="tel" value={profile.phone} disabled />
        </div>
      </div>
    </div>
  );
}
