import { Search, Download, RotateCcw } from 'lucide-react';
import styles from './BookingFilters.module.css';

export default function BookingFilters({
  searchQuery, setSearchQuery,
  statusFilter, setStatusFilter,
  paymentFilter, setPaymentFilter,
  dateFilter, setDateFilter,
  hasActiveFilters, onClearFilters,
  onExport, exportCount,
}) {
  return (
    <section className={styles.filtersContainer} aria-label="Search and filter bookings">
      <div className={styles.topRow}>
        <label className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} aria-hidden="true" />
          <span className={styles.visuallyHidden}>Search bookings</span>
          <input
            type="search" placeholder="Search by booking, guest, property, or host"
            className={styles.searchInput} value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
        <button type="button" className={styles.exportBtn} onClick={onExport} disabled={!exportCount}>
          <Download size={17} /> Export filtered CSV <span className={styles.exportCount}>({exportCount})</span>
        </button>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.dropdownGroup}>
          <label className={styles.visuallyHidden} htmlFor="booking-status-filter">Filter by booking status</label>
          <select id="booking-status-filter" className={styles.select} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">All booking statuses</option>
            <option value="Confirmed">Confirmed</option><option value="Pending">Pending</option>
            <option value="Completed">Completed</option><option value="Ongoing">Ongoing</option><option value="Cancelled">Cancelled</option>
          </select>
          <label className={styles.visuallyHidden} htmlFor="booking-payment-filter">Filter by payment status</label>
          <select id="booking-payment-filter" className={styles.select} value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}>
            <option value="All">All payment statuses</option>
            <option value="Paid">Paid</option><option value="Partially Paid">Partially paid</option>
            <option value="Refunded">Refunded</option><option value="Failed">Failed</option>
          </select>
          <label className={styles.visuallyHidden} htmlFor="booking-date-filter">Filter by booking date</label>
          <select id="booking-date-filter" className={styles.select} value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}>
            <option value="All">All dates</option><option value="Today">Booked today</option>
            <option value="Last 7 Days">Booked in last 7 days</option><option value="This Month">Booked this month</option>
            <option value="Upcoming">Upcoming stays</option>
          </select>
          {hasActiveFilters && <button type="button" className={styles.clearBtn} onClick={onClearFilters}><RotateCcw size={15} /> Clear filters</button>}
        </div>
        <p className={styles.dateHint}>Booking-date filters use the record creation date; upcoming uses check-in date.</p>
      </div>
    </section>
  );
}
