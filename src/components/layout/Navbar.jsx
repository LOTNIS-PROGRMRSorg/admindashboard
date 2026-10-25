import { Search, LogOut } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';
import { clearAccessToken } from '../../lib/api';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.searchContainer}>
        <Search size={18} className={styles.searchIcon} />
        <input type="text" placeholder="Search listings, users..." className={styles.searchInput} />
      </div>

      <div className={styles.actions}>
        <NotificationBell />

        <div className={styles.profile}>
          <div className={styles.avatar}>A</div>
          <div className={styles.profileInfo}>
            <span className={styles.name}>Admin User</span>
            <span className={styles.role}>Superadmin</span>
          </div>
        </div>

        <button className={styles.iconBtn} aria-label="Sign out" title="Sign out" onClick={clearAccessToken}>
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
