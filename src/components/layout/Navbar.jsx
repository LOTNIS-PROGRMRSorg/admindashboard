import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, LogOut, Menu, Search } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';
import { clearAccessToken, getAccessToken } from '../../lib/api';
import { allPages } from './navItems';
import styles from './Navbar.module.css';

/** Who is signed in, read from the session token for display only (the API still checks every request). */
function useSignedInAdmin() {
  return useMemo(() => {
    try {
      const payload = JSON.parse(atob(getAccessToken().split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      const meta = payload.user_metadata || {};
      const name = meta.full_name || meta.name || '';
      const email = payload.email || '';
      return { name: name || email.split('@')[0] || 'Admin', email };
    } catch {
      return { name: 'Admin', email: '' };
    }
  }, []);
}

/** "Jump to" — type a page name (or what you're looking for: "fees", "disputes") and press Enter. */
function JumpTo() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listId = useId();

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return allPages
      .filter((p) => `${p.label} ${p.group} ${p.keywords ?? ''}`.toLowerCase().includes(term))
      .sort((a, b) => Number(!a.label.toLowerCase().startsWith(term)) - Number(!b.label.toLowerCase().startsWith(term)))
      .slice(0, 7);
  }, [q]);

  // "/" focuses the search from anywhere, like most admin tools.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey) return;
      const t = e.target;
      if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (page) => {
    if (!page) return;
    navigate(page.path);
    setQ('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const showList = open && q.trim().length > 0;
  return (
    <div className={styles.searchContainer}>
      <Search size={16} className={styles.searchIcon} aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && results[active] ? `${listId}-${active}` : undefined}
        aria-label="Jump to a page"
        placeholder="Jump to…"
        className={styles.searchInput}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            go(results[active]);
          } else if (e.key === 'Escape') {
            setQ('');
            inputRef.current?.blur();
          }
        }}
      />
      <kbd className={styles.kbd} aria-hidden="true">
        /
      </kbd>
      {showList && (
        <ul id={listId} role="listbox" className={styles.results}>
          {results.length ? (
            results.map((p, i) => (
              <li
                key={p.path}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={`${styles.result} ${i === active ? styles.resultActive : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  go(p);
                }}
                onMouseEnter={() => setActive(i)}
              >
                <p.icon size={16} aria-hidden="true" />
                <span>{p.label}</span>
                <small>{p.group}</small>
                {i === active && <CornerDownLeft size={14} className={styles.enterHint} aria-hidden="true" />}
              </li>
            ))
          ) : (
            <li className={styles.noResults}>No page matches “{q.trim()}”</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function Navbar({ onOpenMenu, menuOpen }) {
  const admin = useSignedInAdmin();
  const initial = admin.name.trim().charAt(0).toUpperCase() || 'A';
  return (
    <header className={styles.navbar}>
      <button
        type="button"
        className={`${styles.iconBtn} ${styles.menuBtn}`}
        onClick={onOpenMenu}
        aria-label="Open menu"
        aria-controls="admin-sidebar"
        aria-expanded={menuOpen}
      >
        <Menu size={20} />
      </button>

      <JumpTo />

      <div className={styles.actions}>
        <NotificationBell />

        <div className={styles.profile} title={admin.email || undefined}>
          <div className={styles.avatar} aria-hidden="true">
            {initial}
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.name}>{admin.name}</span>
            <span className={styles.role}>Administrator</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.iconBtn}
          aria-label="Sign out"
          title="Sign out"
          onClick={clearAccessToken}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
