import { DollarSign, TrendingUp, Calendar, Users, Activity, Target, RefreshCcw } from 'lucide-react';
import StatCard from '../dashboard/StatCard';
import styles from './AnalyticsSummary.module.css';

export default function AnalyticsSummary({ data }) {
  if (!data) return null;

  return (
    <div className={styles.grid}>
      <StatCard 
        title="Total Revenue" 
        value={data.totalRevenue.value} 
        trend={data.totalRevenue.trend} 
        isPositive={data.totalRevenue.isPositive} 
        icon={DollarSign} 
      />
      <StatCard 
        title="Monthly Revenue" 
        value={data.monthlyRevenue.value} 
        trend={data.monthlyRevenue.trend} 
        isPositive={data.monthlyRevenue.isPositive} 
        icon={TrendingUp} 
      />
      <StatCard 
        title="Avg Occupancy Rate" 
        value={data.avgOccupancy.value} 
        trend={data.avgOccupancy.trend} 
        isPositive={data.avgOccupancy.isPositive} 
        icon={Calendar} 
      />
      <StatCard 
        title="Active Users" 
        value={data.activeUsers.value} 
        trend={data.activeUsers.trend} 
        isPositive={data.activeUsers.isPositive} 
        icon={Users} 
      />
      <StatCard 
        title="Booking Growth" 
        value={data.bookingGrowth.value} 
        trend={data.bookingGrowth.trend} 
        isPositive={data.bookingGrowth.isPositive} 
        icon={Activity} 
      />
      <StatCard 
        title="Conversion Rate" 
        value={data.conversionRate.value} 
        trend={data.conversionRate.trend} 
        isPositive={data.conversionRate.isPositive} 
        icon={Target} 
      />
      <StatCard 
        title="Returning Guests" 
        value={data.returningGuests.value} 
        trend={data.returningGuests.trend} 
        isPositive={data.returningGuests.isPositive} 
        icon={RefreshCcw} 
      />
      <StatCard 
        title="Avg Booking Value" 
        value={data.avgBookingValue.value} 
        trend={data.avgBookingValue.trend} 
        isPositive={data.avgBookingValue.isPositive} 
        icon={DollarSign} 
      />
    </div>
  );
}
