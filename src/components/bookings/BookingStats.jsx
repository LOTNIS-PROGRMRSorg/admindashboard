import { CalendarDays, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import StatCard from '../dashboard/StatCard';
import styles from './BookingStats.module.css';

export default function BookingStats({ stats }) {
  return (
    <div className={styles.statsGrid}>
      <StatCard 
        title="Total Bookings" 
        value={stats.totalBookings.value} 
        trend={stats.totalBookings.trend} 
        isPositive={stats.totalBookings.isPositive} 
        icon={CalendarDays} 
      />
      <StatCard 
        title="Confirmed Bookings" 
        value={stats.confirmedBookings.value} 
        trend={stats.confirmedBookings.trend} 
        isPositive={stats.confirmedBookings.isPositive} 
        icon={CheckCircle} 
      />
      <StatCard 
        title="Cancelled Bookings" 
        value={stats.cancelledBookings.value} 
        trend={stats.cancelledBookings.trend} 
        isPositive={stats.cancelledBookings.isPositive} 
        icon={XCircle} 
      />
      <StatCard 
        title="Monthly Revenue" 
        value={stats.monthlyRevenue.value} 
        trend={stats.monthlyRevenue.trend} 
        isPositive={stats.monthlyRevenue.isPositive} 
        icon={DollarSign} 
      />
    </div>
  );
}
