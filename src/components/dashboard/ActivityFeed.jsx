import { Building2, CalendarCheck, Clock, XCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './ActivityFeed.module.css';

const getIcon = (type) => {
  switch (type) {
    case 'listing': return <Building2 size={14} />;
    case 'booking': return <CalendarCheck size={14} />;
    case 'approval': return <Clock size={14} />;
    case 'cancellation': return <XCircle size={14} />;
    case 'user': return <User size={14} />;
    default: return <Clock size={14} />;
  }
};

export default function ActivityFeed({ activities = [], title = "Recent Activities", viewAllTo }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {viewAllTo && <Link className={styles.viewAll} to={viewAllTo}>View activity <span aria-hidden="true">→</span></Link>}
      </div>
      {activities.length === 0 ? (
        <div className={styles.emptyState}>No recent activity is available.</div>
      ) : <div className={styles.feed}>
        {activities.map((activity) => (
          <div key={activity.id} className={styles.item}>
            <div className={`${styles.iconWrapper} ${styles[activity.type]}`}>
              {getIcon(activity.type)}
            </div>
            <div className={styles.content}>
              <span className={styles.text}>{activity.text}</span>
              <span className={styles.time}>{activity.time}</span>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}
