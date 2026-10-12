import styles from './StatCard.module.css';

export default function StatCard({ title, value, icon, color = 'primary' }) {
  const getColorClass = () => {
    switch (color) {
      case 'danger': return styles.iconDanger;
      case 'warning': return styles.iconWarning;
      case 'success': return styles.iconSuccess;
      default: return styles.iconPrimary;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <div className={styles.details}>
          <p className={styles.title}>{title}</p>
          <h3 className={styles.value}>{value}</h3>
        </div>
        <div className={`${styles.iconWrapper} ${getColorClass()}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
