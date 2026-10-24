import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingStats from '../components/bookings/BookingStats';
import BookingFilters from '../components/bookings/BookingFilters';
import BookingTable from '../components/bookings/BookingTable';
import BookingDrawer from '../components/bookings/BookingDrawer';
import CancelBookingModal from '../components/bookings/CancelBookingModal';
import Pagination from '../components/common/Pagination';
import { apiFetch } from '../lib/api';
import { money } from '../lib/format';
import styles from './Bookings.module.css';

const BOOKING_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  active: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'Cancelled',
};

const UNIT_LABELS = { hour: 'Hourly', day: 'Nightly', week: 'Weekly', month: 'Monthly', year: 'Yearly' };

// Payment status reflects what actually happened to the money: a refund row
// (created when a paid booking is cancelled) takes precedence over booking status.
function paymentStatusFor(b) {
  if (b.refund) {
    if (b.refund.status === 'processed') return 'Refunded';
    if (b.refund.status === 'failed') return 'Refund failed';
    return 'Refund pending';
  }
  if (['confirmed', 'active', 'completed'].includes(b.status)) return 'Paid';
  return 'Unpaid';
}

function mapBooking(b) {
  const guestName = [b.renter?.first_name, b.renter?.last_name].filter(Boolean).join(' ') || b.renter?.email || 'Guest';
  return {
    id: b.id,
    service: 'Space rental',
    guestName,
    guestAvatar: guestName.charAt(0).toUpperCase(),
    guestEmail: b.renter?.email || '',
    guestPhone: b.renter?.phone || '',
    propertyName: b.property?.name || 'Property',
    hostName: b.owner_name || 'Unknown host',
    checkInDate: b.start_date,
    checkOutDate: b.end_date,
    stayLabel: `${b.duration ?? 1} day${b.duration === 1 ? '' : 's'} · ${UNIT_LABELS[b.pricing_period] || b.pricing_period || ''}`.trim(),
    currency: b.currency_snapshot || 'GHS',
    totalAmount: b.final_amount ?? 0,
    guestServiceFee: b.guest_service_fee ?? 0,
    hostPayout: b.landlord_payout ?? 0,
    securityDeposit: b.security_deposit ?? 0,
    policy: b.cancellation_policy,
    rawStatus: b.status,
    cancellationReason: b.cancellation_reason,
    cancelledAt: b.cancelled_at,
    bookingStatus: BOOKING_STATUS_LABELS[b.status] || b.status,
    paymentStatus: paymentStatusFor(b),
    refund: b.refund || null,
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
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const load = useCallback(() => {
    apiFetch('/admin/bookings/transactions')
      .then((body) => setTransactions(body.data || []))
      .catch((error) => setTransactionError(error.message));

    apiFetch('/admin/bookings?limit=200')
      .then((body) => setBookings((body.data || []).map(mapBooking)))
      .catch((error) => setBookingsError(error.message));
  }, []);

  useEffect(load, [load]);

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
      // Date filter is ignored in mock logic, assuming all mock data passes.
      const matchesDate = true; 

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [bookings, searchQuery, statusFilter, paymentFilter, dateFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage]);

  useMemo(() => setCurrentPage(1), [searchQuery, statusFilter, paymentFilter, dateFilter]);

  // CSV Export
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Booking ID,Guest Name,Property,Host,Check-in,Check-out,Currency,Amount,Booking Status,Payment Status\n"
      + filteredBookings.map(b => `${b.id},"${b.guestName}","${b.propertyName}","${b.hostName}",${b.checkInDate},${b.checkOutDate},${b.currency},${b.totalAmount},${b.bookingStatus},${b.paymentStatus}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lotnis_bookings_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Actions — cancellation and refunds are real: the backend calculates the
  // refund from the host's policy and queues it for processing on /refunds.
  const handleActionClick = (action, booking) => {
    if (action === 'cancel') setBookingToCancel(booking);
    if (action === 'refund') navigate('/refunds?status=all', { state: { bookingId: booking.id } });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Booking Management</h1>
        <p className={styles.subtitle}>Track and manage all reservations made across the Lotnis platform.</p>
        {bookingsError && <p className={styles.subtitle} style={{ color: '#dc2626' }}>{bookingsError}</p>}
        {notice && <p className={styles.subtitle} style={{ color: 'var(--color-success)' }}>{notice}</p>}
      </div>

      <BookingStats stats={bookingStatsData} />


      <BookingFilters 
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        paymentFilter={paymentFilter} setPaymentFilter={setPaymentFilter}
        dateFilter={dateFilter} setDateFilter={setDateFilter}
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
        onOpenRefund={() => navigate('/refunds?status=all', { state: { bookingId: selectedBooking?.id } })}
      />

      <CancelBookingModal
        booking={bookingToCancel}
        onClose={() => setBookingToCancel(null)}
        onCancelled={(result) => {
          setBookingToCancel(null);
          setNotice(result?.refund
            ? `Booking cancelled. A refund of ${money(result.refund.currency, result.refund.refund_amount)} was queued on the Refunds page.`
            : 'Booking cancelled. Nothing had been paid, so no refund is due.');
          load();
        }}
      />
    </div>
  );
}

