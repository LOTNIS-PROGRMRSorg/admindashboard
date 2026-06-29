import { useState, useMemo } from 'react';
import BookingStats from '../components/bookings/BookingStats';
import BookingFilters from '../components/bookings/BookingFilters';
import BookingTable from '../components/bookings/BookingTable';
import BookingDrawer from '../components/bookings/BookingDrawer';
import ConfirmModal from '../components/users/ConfirmModal'; // Reusing
import Pagination from '../components/common/Pagination';
import { bookingsData as initialBookings, bookingStatsData } from '../data/mockData';
import styles from './Bookings.module.css';

export default function Bookings() {
  const [bookings, setBookings] = useState(initialBookings);
  
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

  // CSV Export Mock
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
