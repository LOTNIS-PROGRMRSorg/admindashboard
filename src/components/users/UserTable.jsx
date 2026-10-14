import { Eye, Trash2, Edit, SearchX, UsersRound } from 'lucide-react';
import StatusBadge from './StatusBadge';
import styles from './UserTable.module.css';

const getInitials = (user) => user.avatar || user.fullName?.split(/\s+/).map((part) => part[0]).slice(0, 2).join('') || '?';

export default function UserTable({ users = [], onView, onDelete, isFiltered = false, onClearFilters }) {
  if (!users || users.length === 0) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.emptyState}>
          {isFiltered ? <SearchX size={38} className={styles.emptyIcon} /> : <UsersRound size={38} className={styles.emptyIcon} />}
          <h3 className={styles.emptyTitle}>{isFiltered ? 'No matching users' : 'No users yet'}</h3>
          <p>{isFiltered ? 'Try another search or clear the filters to see all sample users.' : 'User records will appear here when they are available.'}</p>
          {isFiltered && <button type="button" className={styles.clearEmptyFilters} onClick={onClearFilters}>Clear search and filters</button>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <caption className={styles.srOnly}>Lotnis user directory sample records</caption>
        <thead>
          <tr>
            <th className={styles.th} scope="col">User</th>
            <th className={styles.th} scope="col">Contact</th>
            <th className={styles.th} scope="col">Role</th>
            <th className={styles.th} scope="col">Status</th>
            <th className={styles.th} scope="col">Joined</th>
            <th className={styles.th} scope="col"><span className={styles.srOnly}>Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className={styles.tr}>
              <td className={styles.td}>
                <div className={styles.userCell}>
                  <div className={styles.avatar} aria-hidden="true">{getInitials(user)}</div>
                  <div className={styles.userInfo}>
                    <span className={styles.name}>{user.fullName}</span>
                    <span className={styles.username}>@{user.username} <span className={styles.userId}>| {user.id}</span></span>
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
              <td className={styles.td}><span className={styles.joinedDate}>{user.joinedDate}</span></td>
              <td className={`${styles.td} ${styles.actionCell}`}>
                <div className={styles.actions}>
                  <button 
                    type="button"
                    className={styles.iconBtn} 
                    aria-label={`View ${user.fullName} details`}
                    onClick={() => onView(user)}
                  >
                    <Eye size={16} />
                  </button>
                  <button type="button" className={styles.iconBtn} disabled title="Editing is not available in this prototype." aria-label={`Edit ${user.fullName} unavailable`}>
                    <Edit size={16} />
                  </button>
                  <button 
                    type="button"
                    className={`${styles.iconBtn} ${styles.danger}`} 
                    aria-label={`Remove ${user.fullName} from the sample list`}
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
