import { Search, Plus, LayoutGrid, List } from 'lucide-react';
import styles from './ListingFilters.module.css';

export default function ListingFilters({ 
  searchQuery, setSearchQuery, 
  statusFilter, setStatusFilter, 
  categoryFilter, setCategoryFilter,
  viewMode, setViewMode
}) {
  return (
    <div className={styles.filtersContainer}>
      <div className={styles.topRow}>
        <div className={styles.searchGroup}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search properties, hosts, or locations..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <button className={styles.addBtn}>
          <Plus size={18} />
          Add Listing
        </button>
      </div>
      
      <div className={styles.bottomRow}>
        <div className={styles.dropdownGroup}>
          <select 
            className={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
            <option value="Suspended">Suspended</option>
          </select>
          <select 
            className={styles.select}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Hotel">Hotel</option>
            <option value="Guest House">Guest House</option>
            <option value="Beach House">Beach House</option>
            <option value="Cabin">Cabin</option>
          </select>
        </div>
        
        <div className={styles.viewToggle}>
          <button 
            className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            className={`${styles.viewBtn} ${viewMode === 'table' ? styles.active : ''}`}
            onClick={() => setViewMode('table')}
            title="Table View"
          >
            <List size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
