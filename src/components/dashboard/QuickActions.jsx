import { Plus, FileBarChart, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './QuickActions.module.css';

export default function QuickActions() {
  const actions = [
    { id: 1, label: 'Manage listings', icon: Plus, path: '/listings' },
    { id: 2, label: 'Review reports', icon: FileBarChart, path: '/reports' },
    { id: 3, label: 'Manage users', icon: Users, path: '/users' },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Shortcuts</h3>
        <p className={styles.subtitle}>Jump to a workspace</p>
      </div>
      <div className={styles.grid}>
        {actions.map((action) => (
          <Link key={action.id} to={action.path} className={styles.actionBtn}>
            <div className={styles.iconWrapper}>
              <action.icon size={19} strokeWidth={1.9} />
            </div>
            <span>{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
