import { Search, LayoutGrid, List, RotateCcw } from 'lucide-react';
import styles from './ListingFilters.module.css';

export default function ListingFilters({
  searchQuery, setSearchQuery,
  statusFilter, setStatusFilter,
  categoryFilter, setCategoryFilter,
  categories, hasActiveFilters, onClearFilters,
  viewMode, setViewMode,
}) {
  return (
    <section className={styles.filtersContainer} aria-label="Search and filter listings">
      <div className={styles.searchRow}>
        <label className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} aria-hidden="true" />
          <span className={styles.visuallyHidden}>Search listings</span>
          <input
            type="search"
            placeholder="Search by property, host, location, or ID"
            className={styles.searchInput}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
        <span className={styles.unavailable} title="Listing creation is not available in this prototype">Add listing · unavailable</span>
      </div>

      <div className={styles.controlsRow}>
        <div className={styles.controlGroup}>
          <label className={styles.visuallyHidden} htmlFor="listing-status-filter">Filter by status</label>
          <select id="listing-status-filter" className={styles.select} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">All statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
            <option value="Suspended">Suspended</option>
          </select>
          <label className={styles.visuallyHidden} htmlFor="listing-category-filter">Filter by category</label>
          <select id="listing-category-filter" className={styles.select} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="All">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          {hasActiveFilters && (
            <button type="button" className={styles.clearButton} onClick={onClearFilters}>
              <RotateCcw size={15} /> Clear filters
            </button>
          )}
        </div>

        <div className={styles.viewGroup} role="group" aria-label="Listing display mode">
          <button type="button" className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`} onClick={() => setViewMode('grid')} aria-label="Grid view" aria-pressed={viewMode === 'grid'}>
            <LayoutGrid size={17} /> <span>Grid</span>
          </button>
          <button type="button" className={`${styles.viewBtn} ${viewMode === 'table' ? styles.active : ''}`} onClick={() => setViewMode('table')} aria-label="Table view" aria-pressed={viewMode === 'table'}>
            <List size={17} /> <span>Table</span>
          </button>
        </div>
      </div>
    </section>
  );
}
