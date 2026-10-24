import { Search, Download } from 'lucide-react';
import styles from './BookingFilters.module.css';

export default function BookingFilters({ 
  searchQuery, setSearchQuery, 
  statusFilter, setStatusFilter, 
  paymentFilter, setPaymentFilter,
  dateFilter, setDateFilter,
  onExport
}) {
  return (
    <div className={styles.filtersContainer}>
      <div className={styles.topRow}>
        <div className={styles.searchGroup}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by Booking ID, Guest, Property, or Host..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <button className={styles.exportBtn} onClick={onExport}>
          <Download size={18} />
          Export CSV
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
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select 
            className={styles.select}
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="All">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Refund pending">Refund pending</option>
            <option value="Refunded">Refunded</option>
            <option value="Refund failed">Refund failed</option>
          </select>
          <select 
            className={styles.select}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="All">All Dates</option>
            <option value="Today">Today</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="This Month">This Month</option>
            <option value="Upcoming">Upcoming</option>
          </select>
        </div>
      </div>
    </div>
  );
}
