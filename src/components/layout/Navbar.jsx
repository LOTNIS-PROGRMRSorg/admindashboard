import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, X } from 'lucide-react';
import styles from './Navbar.module.css';

const searchablePages = [
  { label: 'Dashboard', path: '/' },
  { label: 'Users', path: '/users' },
  { label: 'Listings', path: '/listings' },
  { label: 'Bookings', path: '/bookings' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Reports', path: '/reports' },
  { label: 'Settings', path: '/settings' },
];

export default function Navbar({ onMenuClick }) {
  const [query, setQuery] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const matchingPages = query.trim()
    ? searchablePages.filter((page) => page.label.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  const openPage = (page) => {
    navigate(page.path);
    setQuery('');
    setSearchMessage('');
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (matchingPages.length > 0) {
      openPage(matchingPages[0]);
    } else if (query.trim()) {
      setSearchMessage('No dashboard page matches that search.');
    }
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.leftSide}>
        <button type="button" className={styles.menuBtn} onClick={onMenuClick} aria-label="Open navigation menu">
          <Menu size={20} />
        </button>
        <div className={styles.searchArea}>
          <form className={styles.searchContainer} onSubmit={handleSearch} role="search">
            <Search size={17} className={styles.searchIcon} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setSearchMessage(''); }}
              placeholder="Search dashboard pages"
              aria-label="Search dashboard pages"
              aria-describedby={searchMessage ? 'page-search-message' : undefined}
              className={styles.searchInput}
            />
            {query && (
              <button type="button" className={styles.clearSearch} onClick={() => { setQuery(''); setSearchMessage(''); }} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </form>
          {matchingPages.length > 0 && (
            <div className={styles.searchResults} role="listbox" aria-label="Matching pages">
              {matchingPages.slice(0, 4).map((page) => (
                <button type="button" role="option" aria-selected="false" key={page.path} onClick={() => openPage(page)}>
                  <Search size={14} />
                  <span>{page.label}</span>
                  <small>Open page</small>
                </button>
              ))}
            </div>
          )}
          {searchMessage && <span id="page-search-message" className={styles.searchMessage}>{searchMessage}</span>}
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.notificationWrap}>
          <button
            type="button"
            className={`${styles.iconBtn} ${notificationsOpen ? styles.iconBtnActive : ''}`}
            aria-label="Notifications, prototype"
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <Bell size={19} />
          </button>
          {notificationsOpen && (
            <div className={styles.notificationPanel}>
              <div className={styles.notificationHeading}>
                <strong>Notifications</strong>
                <span>Preview</span>
              </div>
              <p>Live alerts are not connected in this frontend prototype.</p>
            </div>
          )}
        </div>

        <div className={styles.profile} aria-label="Signed-in prototype profile: Admin User, Superadmin">
          <div className={styles.avatar}>A</div>
          <div className={styles.profileInfo}>
            <span className={styles.name}>Admin User</span>
            <span className={styles.role}>Superadmin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
