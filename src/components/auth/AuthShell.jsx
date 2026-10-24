import { CalendarCheck, BadgeCheck, Undo2, Plane } from 'lucide-react';
import styles from '../../pages/Auth.module.css';

// Shared frame for the dashboard's signed-out screens (sign in, accept invite).
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.brand} aria-hidden="true">
        <div className={styles.logo}><span className={styles.logoMark}><Plane size={22} /></span> Lotnis</div>
        <div className={styles.pitch}>
          <h2>Run every space, host and booking from one place.</h2>
          <p>The Lotnis control room for the team: verify hosts, oversee reservations and send refunds.</p>
          <ul className={styles.points}>
            <li><BadgeCheck /> Verify hosts and review listings</li>
            <li><CalendarCheck /> Track bookings across every service</li>
            <li><Undo2 /> Process refunds with the policy already applied</li>
          </ul>
        </div>
        <div className={styles.legal}>© {new Date().getFullYear()} Lotnis · Authorised team members only</div>
      </aside>
      <main className={styles.panel}>
        <div className={styles.card}>
          <h1>{title}</h1>
          <p className={styles.sub}>{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
