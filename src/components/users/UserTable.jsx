import { Eye, Trash2, Edit, SearchX } from 'lucide-react';
import StatusBadge from './StatusBadge';
import styles from './UserTable.module.css';

export default function UserTable({ users, onView, onDelete }) {
  if (!users || users.length === 0) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.emptyState}>
          <SearchX size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No users found</h3>
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
            <th className={styles.th}>User</th>
            <th className={styles.th}>Contact</th>
            <th className={styles.th}>Role</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Joined Date</th>
            <th className={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className={styles.tr}>
              <td className={styles.td}>
                <div className={styles.userCell}>
                  <div className={styles.avatar}>{user.avatar}</div>
                  <div className={styles.userInfo}>
                    <span className={styles.name}>{user.fullName}</span>
                    <span className={styles.username}>@{user.username}</span>
                  </div>
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.userInfo}>
                  <span>{user.email}</span>
                  <span className={styles.username}>{user.phone}</span>
                </div>
              </td>
              <td className={styles.td}>
                <span className={styles.role}>{user.role}</span>
              </td>
              <td className={styles.td}>
                <StatusBadge status={user.status} />
              </td>
              <td className={styles.td}>{user.joinedDate}</td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  <button 
                    className={styles.iconBtn} 
                    title="View Details"
                    onClick={() => onView(user)}
                  >
                    <Eye size={16} />
                  </button>
                  <button className={styles.iconBtn} title="Edit User">
                    <Edit size={16} />
                  </button>
                  <button 
                    className={`${styles.iconBtn} ${styles.danger}`} 
                    title="Delete User"
                    onClick={() => onDelete(user)}
                  >
                    <Trash2 size={16} />
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
