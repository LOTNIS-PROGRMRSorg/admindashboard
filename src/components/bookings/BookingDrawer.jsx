import { X, User, Home, Calendar, CreditCard, Mail, Phone, MessageSquare, ShieldAlert } from 'lucide-react';
import BookingStatusBadge from './BookingStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';
import BookingTimeline from './BookingTimeline';
import styles from './BookingDrawer.module.css';

export default function BookingDrawer({ booking, isOpen, onClose, onActionClick }) {
  if (!booking) return null;

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Booking {booking.id}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
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
                <span className={styles.infoValue} style={{color: 'var(--color-success)'}}>{booking.checkInDate}</span>
              </div>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}><Calendar size={14}/> Check-out</span>
                <span className={styles.infoValue} style={{color: 'var(--color-danger)'}}>{booking.checkOutDate}</span>
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
          <button className={`${styles.footerBtn} ${styles.btnOutline}`} onClick={onClose}>
            Close
          </button>
          <button className={`${styles.footerBtn} ${styles.btnPrimary}`}>
            <MessageSquare size={16}/> Contact Guest
          </button>
          
          {(booking.bookingStatus === 'Confirmed' || booking.bookingStatus === 'Ongoing' || booking.bookingStatus === 'Pending') && (
            <button 
              className={`${styles.footerBtn} ${styles.btnDanger}`}
              onClick={() => { onActionClick('cancel', booking); onClose(); }}
            >
              <X size={16}/> Cancel Booking
            </button>
          )}

          {(booking.paymentStatus === 'Paid' || booking.paymentStatus === 'Partially Paid') && booking.bookingStatus !== 'Refunded' && (
            <button 
              className={`${styles.footerBtn} ${styles.btnWarning}`}
              onClick={() => { onActionClick('refund', booking); onClose(); }}
            >
              <ShieldAlert size={16}/> Refund Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
