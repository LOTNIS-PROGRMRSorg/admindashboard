import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import styles from './MainLayout.module.css';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className={`${styles.layout} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((collapsed) => !collapsed)}
        mobileOpen={mobileNavOpen}
        onNavigate={() => setMobileNavOpen(false)}
      />
      {mobileNavOpen && (
        <button
          type="button"
          className={styles.mobileBackdrop}
          aria-label="Close navigation menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <div className={styles.mainContent}>
        <Navbar onMenuClick={() => setMobileNavOpen((open) => !open)} />
        <main className={styles.pageContainer}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
