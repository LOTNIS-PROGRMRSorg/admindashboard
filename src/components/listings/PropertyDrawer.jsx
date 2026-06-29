import { X, MapPin, User, DollarSign, Calendar, Star, CheckCircle, ShieldCheck, Check, X as XIcon } from 'lucide-react';
import ListingStatusBadge from './ListingStatusBadge';
import styles from './PropertyDrawer.module.css';

export default function PropertyDrawer({ property, isOpen, onClose, onApprove, onReject }) {
  if (!property) return null;

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Property Details</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.imageContainer}>
            <img src={property.image} alt={property.title} className={styles.image} />
            <div className={styles.badgeWrapper}>
              <ListingStatusBadge status={property.status} />
            </div>
          </div>

          <h3 className={styles.propertyTitle}>{property.title}</h3>
          <div className={styles.location}>
            <MapPin size={16} />
            {property.location}
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Overview</h4>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><DollarSign size={16} /> Price per Night</span>
              <span className={styles.infoValue}>${property.pricePerNight}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><User size={16} /> Host</span>
              <span className={styles.infoValue}>{property.hostName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><Star size={16} /> Rating</span>
              <span className={styles.infoValue}>{property.rating} / 5.0</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><CheckCircle size={16} /> Bookings</span>
              <span className={styles.infoValue}>{property.bookingsCount}</span>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Details & Verification</h4>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Category</span>
              <span className={styles.infoValue}>{property.category}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><Calendar size={16} /> Listed On</span>
              <span className={styles.infoValue}>{property.dateListed}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}><ShieldCheck size={16} /> Verification</span>
              <span className={styles.infoValue}>{property.verificationStatus}</span>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Amenities</h4>
            <div className={styles.amenitiesGrid}>
              {property.amenities.map((amenity, index) => (
                <div key={index} className={styles.amenityItem}>
                  <Check size={14} className={styles.infoLabel} />
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Description (Preview)</h4>
            <p className={styles.description}>
              This stunning {property.category.toLowerCase()} offers an exceptional stay experience in the heart of {property.location.split(',')[0]}. Designed with modern aesthetics and maximum comfort in mind. Enjoy world-class amenities and reliable hosting by {property.hostName}.
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          {property.status === 'Pending' ? (
            <>
              <button className={`${styles.footerBtn} ${styles.btnApprove}`} onClick={() => { onApprove(property); onClose(); }}>
                <Check size={18} /> Approve
              </button>
              <button className={`${styles.footerBtn} ${styles.btnReject}`} onClick={() => { onReject(property); onClose(); }}>
                <XIcon size={18} /> Reject
              </button>
            </>
          ) : (
            <>
              <button className={`${styles.footerBtn} ${styles.btnOutline}`} onClick={onClose}>
                Close
              </button>
              <button className={`${styles.footerBtn} ${styles.btnOutline}`}>
                Edit Listing
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
