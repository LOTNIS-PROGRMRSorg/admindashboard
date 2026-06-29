import { Users, Building2, CalendarCheck, DollarSign, Clock, UserCheck } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ChartCard from '../components/dashboard/ChartCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import BookingTable from '../components/dashboard/BookingTable';
import QuickActions from '../components/dashboard/QuickActions';
import { statisticsData, chartData, recentActivities, recentBookings } from '../data/mockData';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <div className={styles.dashboard}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Welcome back, Admin</h1>
        <p className={styles.welcomeText}>Here's an overview of the Lotnis platform activity for {today}.</p>
      </div>

      {/* Statistics Grid */}
      <div className={styles.statsGrid}>
        <StatCard 
          title="Total Users" 
          value={statisticsData.totalUsers.value} 
          trend={statisticsData.totalUsers.trend} 
          isPositive={statisticsData.totalUsers.isPositive} 
          icon={Users} 
        />
        <StatCard 
          title="Active Listings" 
          value={statisticsData.activeListings.value} 
          trend={statisticsData.activeListings.trend} 
          isPositive={statisticsData.activeListings.isPositive} 
          icon={Building2} 
        />
        <StatCard 
          title="Total Bookings" 
          value={statisticsData.totalBookings.value} 
          trend={statisticsData.totalBookings.trend} 
          isPositive={statisticsData.totalBookings.isPositive} 
          icon={CalendarCheck} 
        />
        <StatCard 
          title="Monthly Revenue" 
          value={statisticsData.monthlyRevenue.value} 
          trend={statisticsData.monthlyRevenue.trend} 
          isPositive={statisticsData.monthlyRevenue.isPositive} 
          icon={DollarSign} 
        />
        <StatCard 
          title="Pending Approvals" 
          value={statisticsData.pendingApprovals.value} 
          trend={statisticsData.pendingApprovals.trend} 
          isPositive={statisticsData.pendingApprovals.isPositive} 
          icon={Clock} 
        />
        <StatCard 
          title="Active Hosts" 
          value={statisticsData.activeHosts.value} 
          trend={statisticsData.activeHosts.trend} 
          isPositive={statisticsData.activeHosts.isPositive} 
          icon={UserCheck} 
        />
      </div>

      {/* Charts and Quick Actions */}
      <div className={styles.middleSection}>
        <ChartCard 
          title="Revenue & Bookings Overview" 
          subtitle="Monthly performance for the current year"
          data={chartData.revenueAndBookings} 
        />
        <QuickActions />
      </div>

      {/* Bookings Table and Activity Feed */}
      <div className={styles.bottomSection}>
        <BookingTable bookings={recentBookings} />
        <ActivityFeed activities={recentActivities} />
      </div>
    </div>
  );
}
