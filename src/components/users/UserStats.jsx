import { Users, UserCheck, UserX, UserPlus } from 'lucide-react';
import StatCard from '../dashboard/StatCard';
import styles from './UserStats.module.css';

export default function UserStats({ stats }) {
  return (
    <div className={styles.statsGrid}>
      <StatCard 
        title="Total Users" 
        value={stats.totalUsers.value} 
        trend={stats.totalUsers.trend} 
        isPositive={stats.totalUsers.isPositive} 
        icon={Users} 
      />
      <StatCard 
        title="Active Users" 
        value={stats.activeUsers.value} 
        trend={stats.activeUsers.trend} 
        isPositive={stats.activeUsers.isPositive} 
        icon={UserCheck} 
      />
      <StatCard 
        title="Suspended Users" 
        value={stats.suspendedUsers.value} 
        trend={stats.suspendedUsers.trend} 
        isPositive={stats.suspendedUsers.isPositive} 
        icon={UserX} 
      />
      <StatCard 
        title="New This Month" 
        value={stats.newThisMonth.value} 
        trend={stats.newThisMonth.trend} 
        isPositive={stats.newThisMonth.isPositive} 
        icon={UserPlus} 
      />
    </div>
  );
}
