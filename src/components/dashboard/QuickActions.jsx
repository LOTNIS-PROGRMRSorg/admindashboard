import { Link } from 'react-router-dom';
import { BadgeCheck, Undo2, LogOut, CalendarCheck } from 'lucide-react';
import styles from './QuickActions.module.css';

// Admins review and decide; hosts create listings. Shortcuts point at the queues
// that need an admin's attention.
const actions = [
  { to: '/hosts', label: 'Host applications', icon: BadgeCheck },
  { to: '/refunds', label: 'Refunds', icon: Undo2 },
  { to: '/move-outs', label: 'Move-outs', icon: LogOut },
  { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
];

export default function QuickActions() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Needs your attention</h3>
      </div>
      <div className={styles.grid}>
        {actions.map((action) => (
          <Link key={action.to} to={action.to} className={styles.actionBtn}>
            <div className={styles.iconWrapper}>
              <action.icon size={24} />
            </div>
            <span>{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
