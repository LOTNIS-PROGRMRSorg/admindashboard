import { Building2, CheckCircle, Clock, XCircle } from 'lucide-react';
import StatCard from '../dashboard/StatCard';
import styles from './ListingStats.module.css';

export default function ListingStats({ stats }) {
  return (
    <div className={styles.statsGrid}>
      <StatCard 
        title="Total Listings" 
        value={stats.totalListings.value} 
        trend={stats.totalListings.trend} 
        isPositive={stats.totalListings.isPositive} 
        icon={Building2} 
      />
      <StatCard 
        title="Approved Listings" 
        value={stats.approvedListings.value} 
        trend={stats.approvedListings.trend} 
        isPositive={stats.approvedListings.isPositive} 
        icon={CheckCircle} 
      />
      <StatCard 
        title="Pending Approval" 
        value={stats.pendingApproval.value} 
        trend={stats.pendingApproval.trend} 
        isPositive={stats.pendingApproval.isPositive} 
        icon={Clock} 
      />
      <StatCard 
        title="Rejected Listings" 
        value={stats.rejectedListings.value} 
        trend={stats.rejectedListings.trend} 
        isPositive={stats.rejectedListings.isPositive} 
        icon={XCircle} 
      />
    </div>
  );
}
