import { Plus, Search, X } from 'lucide-react';
import styles from './UserFilters.module.css';

export default function UserFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  roleFilter,
  setRoleFilter,
  hasActiveFilters,
  onClearFilters,
}) {
  return (
    <section className={styles.filtersContainer} aria-label="Filter users">
      <div className={styles.filterControls}>
        <label className={styles.searchWrapper}>
          <Search size={17} className={styles.searchIcon} aria-hidden="true" />
          <span className={styles.srOnly}>Search users by name, email, username, phone, or ID</span>
          <input
            type="search"
            placeholder="Search name, email, username, phone, or ID"
            className={styles.searchInput}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          {searchQuery && (
            <button type="button" className={styles.clearSearch} onClick={() => setSearchQuery('')} aria-label="Clear user search">
              <X size={15} />
            </button>
          )}
        </label>

        <label className={styles.selectLabel}>
          <span className={styles.srOnly}>Filter by account status</span>
          <select className={styles.select} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>
        </label>

        <label className={styles.selectLabel}>
          <span className={styles.srOnly}>Filter by user role</span>
          <select className={styles.select} value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="All">All roles</option>
            <option value="Guest">Guest</option>
            <option value="Host">Host</option>
            <option value="Admin">Admin</option>
          </select>
        </label>

        {hasActiveFilters && (
          <button type="button" className={styles.clearFilters} onClick={onClearFilters}>Clear filters</button>
        )}
      </div>

      <div className={styles.addUserGroup}>
        <button
          type="button"
          className={styles.addUserBtn}
          disabled
          title="Adding users is not available in this prototype."
        >
          <Plus size={17} /> Add user
        </button>
        <span className={styles.unavailableNote}>Unavailable in prototype</span>
      </div>
    </section>
  );
}
