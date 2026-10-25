import styles from './ui.module.css';

export const Input = (props) => <input className={styles.input} {...props} />;
export const Select = ({ options, ...props }) => <select className={styles.select} {...props}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>;
export const Textarea = (props) => <textarea className={styles.textarea} {...props} />;
export const Field = ({ label, hint, children }) => <label className={styles.field}><span>{label}{hint && <small> {hint}</small>}</span>{children}</label>;
export const Toolbar = ({ children }) => <div className={styles.toolbar}>{children}</div>;
export const CellMain = ({ title, sub }) => <><div className={styles.cellMain}>{title}</div>{sub && <div className={styles.cellSub}>{sub}</div>}</>;
export const TextLink = ({ to, children }) => <a className={styles.link} href={to}>{children}</a>;
