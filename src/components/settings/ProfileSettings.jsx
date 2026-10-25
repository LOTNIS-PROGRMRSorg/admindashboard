import React, { useState, useEffect } from 'react';
import styles from './SettingsSection.module.css';
import FormInput from './FormInput';

export default function ProfileSettings({ profile, onSave }) {
  const [formData, setFormData] = useState({
    name: profile.name,
    username: profile.username,
    email: profile.email,
    phone: profile.phone,
  });

  // Re-sync the form whenever the real profile arrives (it loads
  // asynchronously after the initial render) or changes after a save.
  useEffect(() => {
    setFormData({
      name: profile.name,
      username: profile.username,
      email: profile.email,
      phone: profile.phone,
    });
  }, [profile.name, profile.username, profile.email, profile.phone]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave && onSave(formData);
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Profile Settings</h2>
        <p className={styles.subtitle}>Manage your public profile and contact information.</p>
      </div>

      <div className={styles.content}>
        <div className={styles.avatarSection}>
          <img src={profile.avatar} alt="Profile" className={styles.avatar} />
          <div>
            <button className={styles.btnSecondary} style={{ marginBottom: '0.5rem' }}>
              Change Avatar
            </button>
            <p className={styles.subtitle} style={{ fontSize: '0.75rem' }}>
              JPG, GIF or PNG. Max size of 800K
            </p>
          </div>
        </div>

        <h3 className={styles.groupTitle}>Personal Information</h3>
        <div className={styles.formGrid}>
          <FormInput label="Full Name" value={formData.name} onChange={(val) => handleChange('name', val)} />
          <FormInput label="Username" value={formData.username} onChange={(val) => handleChange('username', val)} />
          <FormInput
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(val) => handleChange('email', val)}
          />
          <FormInput
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(val) => handleChange('phone', val)}
          />
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.btnSecondary}>Cancel</button>
        <button className={styles.btnPrimary} onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
