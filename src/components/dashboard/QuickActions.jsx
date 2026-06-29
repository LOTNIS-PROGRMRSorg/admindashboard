import { Plus, CheckSquare, FileBarChart, Users } from 'lucide-react';
import styles from './QuickActions.module.css';

export default function QuickActions() {
  const actions = [
    { id: 1, label: 'Add Listing', icon: Plus },
    { id: 2, label: 'Approvals', icon: CheckSquare },
    { id: 3, label: 'Reports', icon: FileBarChart },
    { id: 4, label: 'Users', icon: Users },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Quick Actions</h3>
      </div>
      <div className={styles.grid}>
        {actions.map((action) => (
          <button key={action.id} className={styles.actionBtn}>
            <div className={styles.iconWrapper}>
              <action.icon size={24} />
            </div>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
