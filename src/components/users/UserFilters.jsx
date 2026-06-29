import { Search, Plus } from 'lucide-react';
import styles from './UserFilters.module.css';

export default function UserFilters({ 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter, 
  roleFilter, 
  setRoleFilter 
}) {
  return (
    <div className={styles.filtersContainer}>
      <div className={styles.searchGroup}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by name, username, or email..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.dropdownGroup}>
          <select 
            className={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>
          <select 
            className={styles.select}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Guest">Guest</option>
            <option value="Host">Host</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
      </div>
      <button className={styles.addUserBtn}>
        <Plus size={18} />
        Add User
      </button>
    </div>
  );
}
