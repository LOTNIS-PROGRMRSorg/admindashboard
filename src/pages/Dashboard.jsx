import { Users, Building2, CalendarCheck, DollarSign, Clock, UserCheck, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
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
        <div>
          <span className={styles.eyebrow}>OVERVIEW <span className={styles.dataTag}>SAMPLE DATA</span></span>
          <h1 className={styles.welcomeTitle}>Good day, Admin</h1>
          <p className={styles.welcomeText}>Here’s what’s happening across your accommodation platform.</p>
        </div>
        <div className={styles.dateChip}><span className={styles.dateDot} />{today}</div>
      </div>

      {/* Statistics Grid */}
      <div className={styles.statsGrid}>
        <StatCard 
          title="Total users"
          value={statisticsData.totalUsers.value} 
          trend={statisticsData.totalUsers.trend} 
          isPositive={statisticsData.totalUsers.isPositive} 
          icon={Users} 
        />
        <StatCard 
          title="Active listings"
          value={statisticsData.activeListings.value} 
          trend={statisticsData.activeListings.trend} 
          isPositive={statisticsData.activeListings.isPositive} 
          icon={Building2} 
        />
        <StatCard 
          title="Total bookings"
          value={statisticsData.totalBookings.value} 
          trend={statisticsData.totalBookings.trend} 
          isPositive={statisticsData.totalBookings.isPositive} 
          icon={CalendarCheck} 
        />
        <StatCard 
          title="Monthly revenue"
          value={statisticsData.monthlyRevenue.value} 
          trend={statisticsData.monthlyRevenue.trend} 
          isPositive={statisticsData.monthlyRevenue.isPositive} 
          icon={DollarSign} 
        />
        <StatCard 
          title="Pending approvals"
          value={statisticsData.pendingApprovals.value} 
          trend={statisticsData.pendingApprovals.trend} 
          isPositive={statisticsData.pendingApprovals.isPositive} 
          icon={Clock} 
        />
        <StatCard 
          title="Active hosts"
          value={statisticsData.activeHosts.value} 
          trend={statisticsData.activeHosts.trend} 
          isPositive={statisticsData.activeHosts.isPositive} 
          icon={UserCheck} 
        />
      </div>

      {/* Charts and Quick Actions */}
      <div className={styles.middleSection}>
        <ChartCard 
          title="Revenue and bookings"
          subtitle="Monthly overview · sample figures"
          data={chartData.revenueAndBookings} 
          showBookings
        />
        <QuickActions />
      </div>

      {/* Bookings Table and Activity Feed */}
      <div className={styles.bottomSection}>
        <BookingTable bookings={recentBookings} viewAllTo="/bookings" />
        <ActivityFeed activities={recentActivities} viewAllTo="/analytics" />
      </div>

      <div className={styles.footerNote}>
        <span>Prototype dashboard</span>
        <span>Figures shown here are sample data and are not live platform metrics.</span>
        <Link to="/analytics">Explore analytics <ArrowUpRight size={14} /></Link>
      </div>
    </div>
  );
}
