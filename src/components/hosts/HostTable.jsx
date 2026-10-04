import { Eye, SearchX } from 'lucide-react';
import StatusBadge from '../users/StatusBadge';
import styles from '../users/UserTable.module.css';

export default function HostTable({ hosts, onView }) {
  if (!hosts || hosts.length === 0) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.emptyState}>
          <SearchX size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No host applications found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Host</th>
            <th className={styles.th}>Account type</th>
            <th className={styles.th}>Location</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Applied</th>
            <th className={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {hosts.map((host) => (
            <tr key={host.id} className={styles.tr}>
              <td className={styles.td}>
                <div className={styles.userCell}>
                  <div className={styles.avatar}>{(host.display_name || '?').charAt(0).toUpperCase()}</div>
                  <div className={styles.userInfo}>
                    <span className={styles.name}>{host.display_name}</span>
                    <span className={styles.username}>{host.legal_first_name} {host.legal_last_name}</span>
                  </div>
                </div>
              </td>
              <td className={styles.td}>
                <span className={styles.role}>{host.account_type}</span>
              </td>
              <td className={styles.td}>{[host.city, host.country].filter(Boolean).join(', ')}</td>
              <td className={styles.td}>
                <StatusBadge status={host.verification_status} />
              </td>
              <td className={styles.td}>{host.created_at ? new Date(host.created_at).toLocaleDateString() : ''}</td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  <button className={styles.iconBtn} title="Review application" onClick={() => onView(host)}>
                    <Eye size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
