import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { navGroups, upcomingItems } from './navItems';
import styles from './Sidebar.module.css';

const COLLAPSE_KEY = 'lotnis_admin_sidebar_collapsed';
const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
};

export function BrandMark({ compact }) {
  return (
    <span className={styles.brand}>
      <span className={styles.brandMark} aria-hidden="true">
        L
      </span>
      {!compact && (
        <span className={styles.brandText}>
          lotnis <em>Admin</em>
        </span>
      )}
    </span>
  );
}

/**
 * Desktop: a sticky rail that can collapse to icons (remembered per browser).
 * Phones/tablets: an off-canvas drawer opened from the navbar; closes on navigation, Esc or backdrop tap.
 */
export default function Sidebar({ mobileOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch {
      /* private mode: just don't remember */
    }
  }, [collapsed]);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [mobileOpen, onClose]);

  const link = (item, extra = '') => (
    <NavLink
      key={item.path}
      to={item.path}
      end={item.path === '/'}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) => `${styles.navLink} ${extra} ${isActive ? styles.active : ''}`}
    >
      <item.icon size={18} strokeWidth={1.9} className={styles.icon} aria-hidden="true" />
      <span className={styles.label}>{item.label}</span>
    </NavLink>
  );

  return (
    <>
      <div
        className={`${styles.backdrop} ${mobileOpen ? styles.backdropOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        id="admin-sidebar"
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.open : ''}`}
        aria-label="Admin navigation"
      >
        <div className={styles.logoContainer}>
          <NavLink to="/" className={styles.logoLink} aria-label="Lotnis admin — dashboard">
            <BrandMark compact={collapsed} />
          </NavLink>
          <button
            type="button"
            className={`${styles.toggleBtn} ${styles.desktopOnly}`}
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${styles.mobileOnly}`}
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          {navGroups.map((group) => (
            <div key={group.label ?? 'top'} className={styles.group}>
              {group.label && <span className={styles.groupLabel}>{group.label}</span>}
              {group.items.map((item) => link(item))}
            </div>
          ))}
          <div className={styles.group}>
            <span className={styles.groupLabel}>Coming soon</span>
            {upcomingItems.map((item) => link(item, styles.upcoming))}
          </div>
        </nav>
      </aside>
    </>
  );
}
