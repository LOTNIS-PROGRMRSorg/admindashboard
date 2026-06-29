import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './StatCard.module.css';

export default function StatCard({ title, value, trend, isPositive, icon: Icon }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {Icon && (
          <div className={styles.iconWrapper}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.footer}>
        <span className={`${styles.trend} ${isPositive ? styles.positive : styles.negative}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span style={{ marginLeft: '4px' }}>{Math.abs(trend)}%</span>
        </span>
        <span className={styles.trendText}>from last month</span>
      </div>
    </div>
  );
}
