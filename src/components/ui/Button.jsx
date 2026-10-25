import { Link } from 'react-router-dom';
import styles from './ui.module.css';

const VARIANT = { primary: styles.btnPrimary, danger: styles.btnDanger, success: styles.btnSuccess, ghost: styles.btnGhost, secondary: '' };

/** One button for everything. Pass `to` to render a link. */
export default function Button({ variant = 'secondary', size, to, href, children, className = '', ...rest }) {
  const cls = `${styles.btn} ${VARIANT[variant] ?? ''} ${size === 'sm' ? styles.btnSm : ''} ${className}`;
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>;
  return to ? <Link to={to} className={cls} {...rest}>{children}</Link> : <button type="button" className={cls} {...rest}>{children}</button>;
}

export function IconButton({ label, children, ...rest }) {
  return <button type="button" className={styles.iconBtn} aria-label={label} title={label} {...rest}>{children}</button>;
}
