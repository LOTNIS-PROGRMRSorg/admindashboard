import { Bell, LayoutDashboard, Palette, Shield, UserRound, UserRoundCog } from 'lucide-react';
import styles from './SettingsSidebar.module.css';

const TABS = [
  { id: 'profile', label: 'Profile', Icon: UserRound },
  { id: 'account', label: 'Account', Icon: UserRoundCog },
  { id: 'appearance', label: 'Appearance', Icon: Palette },
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'notifications', label: 'Notifications', Icon: Bell },
  { id: 'security', label: 'Security', Icon: Shield },
];

export default function SettingsSidebar({ activeTab, onTabChange }) {
  return (
    <div className={styles.sidebar}>
      <nav className={styles.nav} aria-label="Settings sections">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`${styles.tabBtn} ${activeTab === id ? styles.active : ''}`}
            onClick={() => onTabChange(id)}
            aria-current={activeTab === id ? 'page' : undefined}
          >
            <Icon className={styles.icon} size={18} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
