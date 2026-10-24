import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CalendarCheck, 
  LineChart, 
  FileText, 
  Settings,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Plane,
  BadgeCheck,
  Undo2,
  LogOut,
  Ticket,
  Wallet,
  UtensilsCrossed,
  Wrench
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/listings', label: 'Listings', icon: Building2 },
  { path: '/events', label: 'Events', icon: Ticket },
  { path: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { path: '/hosts', label: 'Hosts', icon: BadgeCheck },
  { path: '/move-outs', label: 'Move-outs', icon: LogOut },
  { path: '/refunds', label: 'Refunds', icon: Undo2 },
  { path: '/payouts', label: 'Payouts', icon: Wallet },
  { path: '/analytics', label: 'Analytics', icon: LineChart },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/configuration', label: 'Configuration', icon: SlidersHorizontal },
  { path: '/settings', label: 'Settings', icon: Settings },
];

// Business lines still to be built. They get real routes (a placeholder page
// today) so each one can be switched on without touching navigation again.
const upcomingItems = [
  { path: '/food', label: 'Food', icon: UtensilsCrossed },
  { path: '/services', label: 'Services', icon: Wrench },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.logoContainer}>
        {!collapsed && (
          <div className={styles.logo}>
            <Plane size={24} />
            <span>Lotnis</span>
          </div>
        )}
        {collapsed && (
          <div className={styles.logo} style={{ justifyContent: 'center', width: '100%' }}>
            <Plane size={24} />
          </div>
        )}
        <button 
          className={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <item.icon size={20} className={styles.icon} />
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}

        {!collapsed && <span className={styles.groupLabel}>Coming soon</span>}
        {upcomingItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navLink} ${styles.upcoming} ${isActive ? styles.active : ''}`
            }
          >
            <item.icon size={20} className={styles.icon} />
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
