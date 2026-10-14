import { useMemo, useState } from 'react';
import BookingStats from '../components/bookings/BookingStats';
import BookingFilters from '../components/bookings/BookingFilters';
import BookingTable from '../components/bookings/BookingTable';
import BookingDrawer from '../components/bookings/BookingDrawer';
import ConfirmModal from '../components/users/ConfirmModal';
import Pagination from '../components/common/Pagination';
import { bookingsData as initialBookings } from '../data/mockData';
import styles from './Bookings.module.css';

const ITEMS_PER_PAGE = 8;
const todayIso = () => new Date().toISOString().slice(0, 10);

function matchesDateFilter(booking, filter, today) {
  if (filter === 'All') return true;
  if (filter === 'Upcoming') return booking.checkInDate >= today && !['Cancelled', 'Completed'].includes(booking.bookingStatus);
  if (!booking.bookingDate) return false;
  if (filter === 'Today') return booking.bookingDate === today;
  if (filter === 'Last 7 Days') {
    const start = new Date(`${today}T00:00:00.000Z`);
    start.setUTCDate(start.getUTCDate() - 6);
    return booking.bookingDate >= start.toISOString().slice(0, 10) && booking.bookingDate <= today;
  }
  if (filter === 'This Month') return booking.bookingDate.slice(0, 7) === today.slice(0, 7);
  return true;
}

function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export default function Bookings() {
  const [bookings, setBookings] = useState(initialBookings);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingToConfirm, setBookingToConfirm] = useState(null);
  const [confirmActionType, setConfirmActionType] = useState('');

  const today = todayIso();
  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return bookings.filter((booking) => {
      const searchFields = [booking.id, booking.guestName, booking.guestEmail, booking.guestPhone, booking.propertyName, booking.hostName];
      const matchesSearch = !query || searchFields.some((field) => String(field ?? '').toLowerCase().includes(query));
      const matchesStatus = statusFilter === 'All' || booking.bookingStatus === statusFilter;
      const matchesPayment = paymentFilter === 'All' || booking.paymentStatus === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment && matchesDateFilter(booking, dateFilter, today);
    });
  }, [bookings, searchQuery, statusFilter, paymentFilter, dateFilter, today]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const page = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedBookings = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBookings, page]);
  const hasActiveFilters = Boolean(searchQuery.trim()) || statusFilter !== 'All' || paymentFilter !== 'All' || dateFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPaymentFilter('All');
    setDateFilter('All');
    setCurrentPage(1);
  };
  const updateFilter = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const exportCsv = () => {
    const columns = [
      ['Booking ID', 'id'], ['Guest Name', 'guestName'], ['Guest Email', 'guestEmail'], ['Guest Phone', 'guestPhone'],
      ['Property', 'propertyName'], ['Host', 'hostName'], ['Check-in Date', 'checkInDate'], ['Check-out Date', 'checkOutDate'],
      ['Guests', 'guestsCount'], ['Total Amount', 'totalAmount'], ['Booking Status', 'bookingStatus'],
      ['Payment Status', 'paymentStatus'], ['Booking Date', 'bookingDate'],
    ];
    const rows = [columns.map(([label]) => csvCell(label)).join(','), ...filteredBookings.map((booking) => columns.map(([, key]) => csvCell(booking[key])).join(','))];
    const blob = new Blob([`\uFEFF${rows.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lotnis_bookings_filtered_${today}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const requestAction = (action, booking) => {
    setBookingToConfirm(booking);
    setConfirmActionType(action);
  };
  const closeConfirmation = () => {
    setBookingToConfirm(null);
    setConfirmActionType('');
  };
  const confirmAction = () => {
    if (!bookingToConfirm) return;
    const updatedBooking = confirmActionType === 'cancel'
      ? { ...bookingToConfirm, bookingStatus: 'Cancelled' }
      : { ...bookingToConfirm, paymentStatus: 'Refunded' };
    setBookings((current) => current.map((booking) => booking.id === updatedBooking.id ? updatedBooking : booking));
    setSelectedBooking((current) => current?.id === updatedBooking.id ? { ...current, ...updatedBooking } : current);
    closeConfirmation();
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>RESERVATION OPERATIONS</p>
          <h1 className={styles.title}>Bookings</h1>
          <p className={styles.subtitle}>Review reservation details and manage booking records from the sample dataset.</p>
        </div>
        <span className={styles.dataNote}>Sample data · actions are local only</span>
      </header>

      <BookingStats bookings={bookings} />
      <BookingFilters
        searchQuery={searchQuery} setSearchQuery={updateFilter(setSearchQuery)}
        statusFilter={statusFilter} setStatusFilter={updateFilter(setStatusFilter)}
        paymentFilter={paymentFilter} setPaymentFilter={updateFilter(setPaymentFilter)}
        dateFilter={dateFilter} setDateFilter={updateFilter(setDateFilter)}
        hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters}
        onExport={exportCsv} exportCount={filteredBookings.length}
      />

      <BookingTable bookings={paginatedBookings} onView={setSelectedBooking} hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters} />
      <Pagination
        currentPage={page} totalPages={totalPages} totalItems={filteredBookings.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={(nextPage) => setCurrentPage(Math.max(1, Math.min(nextPage, Math.max(totalPages, 1))))}
      />

      <BookingDrawer
        booking={selectedBooking} isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)} onActionClick={requestAction}
      />
      <ConfirmModal
        isOpen={Boolean(bookingToConfirm)} onClose={closeConfirmation} onConfirm={confirmAction}
        title={confirmActionType === 'cancel' ? 'Cancel this booking?' : 'Mark payment as refunded?'}
        message={confirmActionType === 'cancel'
          ? `Cancel booking ${bookingToConfirm?.id} for ${bookingToConfirm?.guestName}?`
          : `Mark the payment for booking ${bookingToConfirm?.id} as refunded?`}
        note="This only changes the local prototype record. No booking is cancelled with a provider and no payment or refund is processed."
        confirmText={confirmActionType === 'cancel' ? 'Cancel booking' : 'Mark as refunded'}
        isDanger
      />
    </div>
  );
}
