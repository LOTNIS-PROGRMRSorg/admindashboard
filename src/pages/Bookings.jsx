import { useState, useMemo, useEffect } from 'react';
import BookingStats from '../components/bookings/BookingStats';
import BookingFilters from '../components/bookings/BookingFilters';
import BookingTable from '../components/bookings/BookingTable';
import BookingDrawer from '../components/bookings/BookingDrawer';
import ConfirmModal from '../components/users/ConfirmModal'; // Reusing
import Pagination from '../components/common/Pagination';
import { apiFetch } from '../lib/api';
import styles from './Bookings.module.css';

const BOOKING_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  active: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'Cancelled',
};

function paymentStatusFor(status) {
  if (['confirmed', 'active', 'completed'].includes(status)) return 'Paid';
  if (status === 'cancelled' || status === 'no_show') return 'Refunded';
  return 'Partially Paid';
}

function mapBooking(b) {
  const guestName = [b.renter?.first_name, b.renter?.last_name].filter(Boolean).join(' ') || b.renter?.email || 'Guest';
  return {
    id: b.id,
    guestName,
    guestAvatar: guestName.charAt(0).toUpperCase(),
    guestEmail: b.renter?.email || '',
    guestPhone: b.renter?.phone || '',
    propertyName: b.property?.name || 'Property',
    hostName: b.owner_name || 'Unknown host',
    checkInDate: b.start_date,
    checkOutDate: b.end_date,
    guestsCount: b.duration ?? 1,
    totalAmount: b.final_amount ?? 0,
    bookingStatus: BOOKING_STATUS_LABELS[b.status] || b.status,
    paymentStatus: paymentStatusFor(b.status),
    bookingDate: b.created_at,
    notes: b.owner_notes || '',
    timeline: [],
  };
}

const emptyStats = {
  totalBookings: { value: 0, trend: 0, isPositive: true },
  confirmedBookings: { value: 0, trend: 0, isPositive: true },
  cancelledBookings: { value: 0, trend: 0, isPositive: true },
  monthlyRevenue: { value: '—', trend: 0, isPositive: true },
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transactionError, setTransactionError] = useState('');
  const [bookingsError, setBookingsError] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All'); // Simple frontend mock for date ranges
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals/Drawers
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingToConfirm, setBookingToConfirm] = useState(null);
  const [confirmActionType, setConfirmActionType] = useState(''); // 'cancel' or 'refund'

  useEffect(() => {
    apiFetch('/admin/bookings/transactions')
      .then((body) => setTransactions(body.data || []))
      .catch((error) => setTransactionError(error.message));

    apiFetch('/admin/bookings?limit=200')
      .then((body) => setBookings((body.data || []).map(mapBooking)))
      .catch((error) => setBookingsError(error.message));
  }, []);

  const bookingStatsData = useMemo(() => {
    if (!bookings.length) return emptyStats;
    const confirmed = bookings.filter((b) => b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Completed' || b.bookingStatus === 'Ongoing').length;
    const cancelled = bookings.filter((b) => b.bookingStatus === 'Cancelled').length;
    const thisMonth = new Date();
    const monthlyRevenue = transactions
      .filter((t) => {
        const created = new Date(t.created_at);
        return created.getMonth() === thisMonth.getMonth() && created.getFullYear() === thisMonth.getFullYear();
      })
      .reduce((sum, t) => sum + (t.platform_fee || 0), 0);
    const currency = transactions[0]?.currency || 'GHS';
    return {
      totalBookings: { value: bookings.length, trend: 0, isPositive: true },
      confirmedBookings: { value: confirmed, trend: 0, isPositive: true },
      cancelledBookings: { value: cancelled, trend: 0, isPositive: cancelled === 0 },
      monthlyRevenue: { value: `${currency} ${monthlyRevenue.toLocaleString()}`, trend: 0, isPositive: true },
    };
  }, [bookings, transactions]);

  // Filtering Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = 
        booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.hostName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || booking.bookingStatus === statusFilter;
      const matchesPayment = paymentFilter === 'All' || booking.paymentStatus === paymentFilter;
      // Date filtering is not implemented in this mock-data view yet.
      const matchesDate = true; 

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [bookings, searchQuery, statusFilter, paymentFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePaymentFilterChange = (value) => {
    setPaymentFilter(value);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    setCurrentPage(1);
  };

  // CSV Export
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Booking ID,Guest Name,Property,Host,Check-in,Check-out,Amount,Booking Status,Payment Status\n"
      + filteredBookings.map(b => `${b.id},"${b.guestName}","${b.propertyName}","${b.hostName}",${b.checkInDate},${b.checkOutDate},${b.totalAmount},${b.bookingStatus},${b.paymentStatus}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lotnis_bookings_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Actions
  const handleActionClick = (action, booking) => {
    setBookingToConfirm(booking);
    setConfirmActionType(action);
  };

  const handleConfirmAction = () => {
    if (bookingToConfirm) {
      setBookings(prev => prev.map(booking => {
        if (booking.id === bookingToConfirm.id) {
          if (confirmActionType === 'cancel') {
            return { ...booking, bookingStatus: 'Cancelled' };
          }
          if (confirmActionType === 'refund') {
            return { ...booking, paymentStatus: 'Refunded' };
          }
        }
        return booking;
      }));
      
      setBookingToConfirm(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Booking Management</h1>
        <p className={styles.subtitle}>Track and manage all reservations made across the Lotnis platform.</p>
        {bookingsError && <p className={styles.subtitle} style={{ color: '#dc2626' }}>{bookingsError}</p>}
      </div>

      <BookingStats stats={bookingStatsData} />


      <BookingFilters 
        searchQuery={searchQuery} setSearchQuery={handleSearchChange}
        statusFilter={statusFilter} setStatusFilter={handleStatusFilterChange}
        paymentFilter={paymentFilter} setPaymentFilter={handlePaymentFilterChange}
        dateFilter={dateFilter} setDateFilter={handleDateFilterChange}
        onExport={handleExportCSV}
      />

      <BookingTable 
        bookings={paginatedBookings} 
        onView={(b) => setSelectedBooking(b)} 
      />

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredBookings.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      <BookingDrawer 
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onActionClick={handleActionClick}
      />

      <ConfirmModal 
        isOpen={!!bookingToConfirm}
        onClose={() => setBookingToConfirm(null)}
        onConfirm={handleConfirmAction}
        title={confirmActionType === 'cancel' ? 'Cancel Booking' : 'Refund Payment'}
        message={
          confirmActionType === 'cancel' 
            ? `Are you sure you want to cancel booking ${bookingToConfirm?.id} for ${bookingToConfirm?.guestName}?`
            : `Are you sure you want to issue a refund for booking ${bookingToConfirm?.id}?`
        }
        confirmText={confirmActionType === 'cancel' ? 'Cancel Booking' : 'Issue Refund'}
        isDanger={true}
      />
    </div>
  );
}

