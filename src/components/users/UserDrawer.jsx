import { X, Mail, Phone, Calendar, ShieldCheck, ShieldAlert } from 'lucide-react';
import StatusBadge from './StatusBadge';
import styles from './UserDrawer.module.css';

export default function UserDrawer({ user, isOpen, onClose }) {
  if (!user) return null;

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>User Details</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarLg}>{user.avatar}</div>
            <h3 className={styles.name}>{user.fullName}</h3>
            <span className={styles.username}>@{user.username}</span>
            <StatusBadge status={user.status} />
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Contact Information</h4>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><Mail size={16} /> Email</span>
              <span className={styles.infoValue}>{user.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><Phone size={16} /> Phone</span>
              <span className={styles.infoValue}>{user.phone}</span>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Account Details</h4>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><Calendar size={16} /> Joined</span>
              <span className={styles.infoValue}>{user.joinedDate}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Role</span>
              <span className={styles.infoValue}>{user.role}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>
                {user.verified ? <ShieldCheck size={16} color="var(--color-success)"/> : <ShieldAlert size={16} color="var(--color-warning)"/>}
                Verification
              </span>
              <span className={styles.infoValue}>{user.verified ? 'Verified' : 'Unverified'}</span>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Platform Activity</h4>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Total Bookings</span>
              <span className={styles.infoValue}>{user.bookingsCount}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Properties Listed</span>
              <span className={styles.infoValue}>{user.listingsCount}</span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={`${styles.footerBtn} ${styles.btnOutline}`} onClick={onClose}>
            Close
          </button>
          <button className={`${styles.footerBtn} ${styles.btnPrimary}`}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
