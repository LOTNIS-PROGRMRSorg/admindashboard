import { RotateCcw, Search } from 'lucide-react';
import styles from './Controls.module.css';

export default function Controls({
  searchTerm, onSearchChange, statusFilter, onStatusFilterChange,
  categoryFilter, onCategoryFilterChange, priorityFilter, onPriorityFilterChange,
  categories, hasActiveFilters, onClearFilters,
}) {
  return (
    <section className={styles.controls} aria-label="Search and filter reports">
      <label className={styles.searchBox}>
        <Search size={17} className={styles.searchIcon} aria-hidden="true" />
        <span className={styles.visuallyHidden}>Search reports</span>
        <input type="search" placeholder="Search ID, category, reporter, entity, or notes" className={styles.searchInput} value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} />
      </label>

      <div className={styles.filters}>
        <label className={styles.visuallyHidden} htmlFor="report-status-filter">Filter by status</label>
        <select id="report-status-filter" className={styles.select} value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
          <option value="All">All statuses</option>
          <option value="Pending">Pending</option><option value="Under Review">Under review</option>
          <option value="Escalated">Escalated</option><option value="Resolved">Resolved</option><option value="Closed">Closed</option>
        </select>
        <label className={styles.visuallyHidden} htmlFor="report-category-filter">Filter by category</label>
        <select id="report-category-filter" className={styles.select} value={categoryFilter} onChange={(event) => onCategoryFilterChange(event.target.value)}>
          <option value="All">All categories</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <label className={styles.visuallyHidden} htmlFor="report-priority-filter">Filter by priority</label>
        <select id="report-priority-filter" className={styles.select} value={priorityFilter} onChange={(event) => onPriorityFilterChange(event.target.value)}>
          <option value="All">All priorities</option>
          <option value="Critical">Critical</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
        </select>
        {hasActiveFilters && <button type="button" className={styles.clearButton} onClick={onClearFilters}><RotateCcw size={15} /> Clear filters</button>}
      </div>
    </section>
  );
}
