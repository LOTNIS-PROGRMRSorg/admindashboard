import styles from './ui.module.css';

/** The vertical rhythm every page shares. */
export default function Page({ children }) {
  return <div className={styles.page}>{children}</div>;
}
