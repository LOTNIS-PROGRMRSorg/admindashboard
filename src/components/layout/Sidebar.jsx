import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CalendarCheck, 
  LineChart, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Plane,
  LifeBuoy
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navSections = [
  { label: 'Workspace', items: [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  ] },
  { label: 'Management', items: [
    { path: '/users', label: 'Users', icon: Users },
    { path: '/listings', label: 'Listings', icon: Building2 },
    { path: '/bookings', label: 'Bookings', icon: CalendarCheck },
  ] },
  { label: 'Insights', items: [
    { path: '/analytics', label: 'Analytics', icon: LineChart },
    { path: '/reports', label: 'Reports', icon: FileText },
  ] },
  { label: 'Preferences', items: [
    { path: '/settings', label: 'Settings', icon: Settings },
  ] },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onNavigate }) {
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
      <div className={styles.logoContainer}>
        <div className={styles.logo} aria-label="Lotnis admin">
          <span className={styles.logoMark}><Plane size={19} /></span>
          <span className={styles.logoText}>Lotnis<span className={styles.logoCaption}>ADMIN CONSOLE</span></span>
        </div>
        <button 
          type="button"
          className={styles.toggleBtn}
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {navSections.map((section) => (
          <div className={styles.navSection} key={section.label}>
            <span className={styles.sectionLabel}>{section.label}</span>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                <item.icon size={19} className={styles.icon} strokeWidth={1.9} />
                <span className={styles.label}>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.footerIcon}><LifeBuoy size={17} /></div>
        <div className={styles.footerText}>
          <span>Need a hand?</span>
          <small>Help center</small>
        </div>
      </div>
    </aside>
  );
}
