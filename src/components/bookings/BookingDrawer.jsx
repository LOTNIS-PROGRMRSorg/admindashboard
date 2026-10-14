import { useEffect } from 'react';
import { X, User, Home, Calendar, CreditCard, Mail, Phone, ShieldAlert } from 'lucide-react';
import BookingStatusBadge from './BookingStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';
import BookingTimeline from './BookingTimeline';
import styles from './BookingDrawer.module.css';

export default function BookingDrawer({ booking, isOpen, onClose, onActionClick }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!booking) return null;

  const formatDate = (value) => value
    ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00.000Z`))
    : '—';

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={onClose}>
      <div className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="booking-drawer-title" onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title} id="booking-drawer-title">Booking {booking.id}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close booking details">
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.badgeHeader}>
            <BookingStatusBadge status={booking.bookingStatus} />
            <PaymentStatusBadge status={booking.paymentStatus} />
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Guest Details</h4>
            <div className={styles.infoGrid}>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}><User size={14}/> Name</span>
                <span className={styles.infoValue}>{booking.guestName}</span>
              </div>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}><User size={14}/> Guests</span>
                <span className={styles.infoValue}>{booking.guestsCount} People</span>
              </div>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}><Mail size={14}/> Email</span>
                <span className={styles.infoValue}>{booking.guestEmail}</span>
              </div>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}><Phone size={14}/> Phone</span>
                <span className={styles.infoValue}>{booking.guestPhone}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Property & Stay</h4>
            <div className={styles.infoGrid}>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}><Home size={14}/> Property</span>
                <span className={styles.infoValue}>{booking.propertyName}</span>
              </div>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}><User size={14}/> Host</span>
                <span className={styles.infoValue}>{booking.hostName}</span>
              </div>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}><Calendar size={14}/> Check-in</span>
                <span className={styles.infoValue} style={{color: 'var(--color-success)'}}>{formatDate(booking.checkInDate)}</span>
              </div>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}><Calendar size={14}/> Check-out</span>
                <span className={styles.infoValue} style={{color: 'var(--color-danger)'}}>{formatDate(booking.checkOutDate)}</span>
              </div>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}><Calendar size={14}/> Booking date</span>
                <span className={styles.infoValue}>{formatDate(booking.bookingDate)}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Financials</h4>
            <div className={styles.infoGrid}>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}><CreditCard size={14}/> Total Amount</span>
                <span className={styles.infoValue} style={{fontSize: '1.25rem', fontWeight: 700}}>${booking.totalAmount}</span>
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Booking Notes</h4>
              <p className={styles.notes}>{booking.notes}</p>
            </div>
          )}

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Activity Timeline</h4>
            <BookingTimeline timeline={booking.timeline} />
          </div>

        </div>

        <div className={styles.footer}>
          <button type="button" className={`${styles.footerBtn} ${styles.btnOutline}`} onClick={onClose}>
            Close
          </button>
          <button type="button" className={`${styles.footerBtn} ${styles.btnPrimary}`} disabled title="Guest messaging is not available in this prototype">
            Contact unavailable
          </button>
          
          {(booking.bookingStatus === 'Confirmed' || booking.bookingStatus === 'Ongoing' || booking.bookingStatus === 'Pending') && (
            <button type="button"
              className={`${styles.footerBtn} ${styles.btnDanger}`}
              onClick={() => onActionClick('cancel', booking)}
            >
              <X size={16}/> Cancel Booking
            </button>
          )}

          {(booking.paymentStatus === 'Paid' || booking.paymentStatus === 'Partially Paid') && (
            <button type="button"
              className={`${styles.footerBtn} ${styles.btnWarning}`}
              onClick={() => onActionClick('refund', booking)}
            >
              <ShieldAlert size={16}/> Refund Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
