import { useEffect, useState } from 'react';
import { Users, Building2, CalendarCheck, DollarSign, Clock, UserCheck } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ChartCard from '../components/dashboard/ChartCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import BookingTable from '../components/dashboard/BookingTable';
import QuickActions from '../components/dashboard/QuickActions';
import { apiFetch } from '../lib/api';
import styles from './Dashboard.module.css';

const emptyStat = { value: '—', trend: 0, isPositive: true };

export default function Dashboard() {
  const [statistics, setStatistics] = useState({
    totalUsers: emptyStat,
    activeListings: emptyStat,
    totalBookings: emptyStat,
    monthlyRevenue: emptyStat,
    pendingApprovals: emptyStat,
    activeHosts: emptyStat,
  });
  const [revenueChart, setRevenueChart] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [error, setError] = useState('');

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  useEffect(() => {
    let cancelled = false;
    apiFetch('/admin/dashboard/stats')
      .then((data) => {
        if (cancelled) return;
        setStatistics(data.statistics);
        setRevenueChart(data.revenueChart);
        setRecentBookings(data.recentBookings);
        setRecentActivities(data.recentActivities);
      })
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.dashboard}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Welcome back, Admin</h1>
        <p className={styles.welcomeText}>Here's an overview of the Lotnis platform activity for {today}.</p>
        {error && <p className={styles.welcomeText} style={{ color: 'var(--color-danger, #dc2626)' }}>Unable to load live stats: {error}</p>}
      </div>

      {/* Statistics Grid */}
      <div className={styles.statsGrid}>
        <StatCard 
          title="Total Users" 
          value={statistics.totalUsers.value} 
          trend={statistics.totalUsers.trend} 
          isPositive={statistics.totalUsers.isPositive} 
          icon={Users} 
        />
        <StatCard 
          title="Active Listings" 
          value={statistics.activeListings.value} 
          trend={statistics.activeListings.trend} 
          isPositive={statistics.activeListings.isPositive} 
          icon={Building2} 
        />
        <StatCard 
          title="Total Bookings" 
          value={statistics.totalBookings.value} 
          trend={statistics.totalBookings.trend} 
          isPositive={statistics.totalBookings.isPositive} 
          icon={CalendarCheck} 
        />
        <StatCard 
          title="Monthly Revenue" 
          value={statistics.monthlyRevenue.value} 
          trend={statistics.monthlyRevenue.trend} 
          isPositive={statistics.monthlyRevenue.isPositive} 
          icon={DollarSign} 
        />
        <StatCard 
          title="Pending Approvals" 
          value={statistics.pendingApprovals.value} 
          trend={statistics.pendingApprovals.trend} 
          isPositive={statistics.pendingApprovals.isPositive} 
          icon={Clock} 
        />
        <StatCard 
          title="Active Hosts" 
          value={statistics.activeHosts.value} 
          trend={statistics.activeHosts.trend} 
          isPositive={statistics.activeHosts.isPositive} 
          icon={UserCheck} 
        />
      </div>

      {/* Charts and Quick Actions */}
      <div className={styles.middleSection}>
        <ChartCard 
          title="Revenue & Bookings Overview" 
          subtitle="Monthly performance for the last 6 months"
          data={revenueChart} 
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

