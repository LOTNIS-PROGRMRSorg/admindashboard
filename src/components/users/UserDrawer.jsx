import { useEffect, useRef } from 'react';
import { X, Mail, Phone, Calendar, ShieldCheck, ShieldAlert } from 'lucide-react';
import StatusBadge from './StatusBadge';
import styles from './UserDrawer.module.css';

export default function UserDrawer({ user, isOpen, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!user || !isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="user-drawer-title" onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title} id="user-drawer-title">User details</h2>
            <p className={styles.headerCaption}>Sample account record</p>
          </div>
          <button ref={closeButtonRef} type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close user details">
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarLg} aria-hidden="true">{user.avatar || user.fullName?.split(/\s+/).map((part) => part[0]).slice(0, 2).join('') || '?'}</div>
            <h3 className={styles.name}>{user.fullName}</h3>
            <span className={styles.username}>@{user.username}</span>
            <StatusBadge status={user.status} />
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Contact Information</h4>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><Mail size={16} /> Email</span>
              <span className={styles.infoValue}>{user.email || 'Not provided'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><Phone size={16} /> Phone</span>
              <span className={styles.infoValue}>{user.phone || 'Not provided'}</span>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Account Details</h4>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>User ID</span>
              <span className={styles.infoValue}>{user.id}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><Calendar size={16} /> Joined</span>
              <span className={styles.infoValue}>{user.joinedDate || 'Not provided'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Role</span>
              <span className={styles.infoValue}>{user.role || 'Not provided'}</span>
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
              <span className={styles.infoValue}>{user.bookingsCount ?? 0}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Properties Listed</span>
              <span className={styles.infoValue}>{user.listingsCount ?? 0}</span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <span className={styles.prototypeNote}>Details are read-only sample data.</span>
          <div className={styles.footerActions}>
            <button type="button" className={`${styles.footerBtn} ${styles.btnOutline}`} onClick={onClose}>
              Close
            </button>
            <button type="button" className={`${styles.footerBtn} ${styles.btnPrimary}`} disabled title="Editing user profiles is not available in this prototype.">
              Edit unavailable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
