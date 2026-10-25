import { formatDateTime } from '../../lib/format';
import styles from './ui.module.css';

export default function Timeline({ items }) {
  return (
    <ol className={styles.timeline}>
      {items.map((i, n) => <li key={n}><span className={styles.timelineWhen}>{formatDateTime(i.at)}</span>{i.text}</li>)}
    </ol>
  );
}
