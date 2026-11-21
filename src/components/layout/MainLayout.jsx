import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import styles from './MainLayout.module.css';

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  return (
    <div className={styles.layout}>
      <a className={styles.skipLink} href="#admin-main">
        Skip to content
      </a>
      <Sidebar mobileOpen={menuOpen} onClose={closeMenu} />
      <div className={styles.mainContent}>
        <Navbar onOpenMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />
        <main id="admin-main" tabIndex={-1} className={styles.pageContainer}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
