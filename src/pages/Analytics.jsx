import { useState, useEffect } from 'react';
import AnalyticsHeader from '../components/analytics/AnalyticsHeader';
import AnalyticsSummary from '../components/analytics/AnalyticsSummary';
import RevenueCharts from '../components/analytics/RevenueCharts';
import BookingGrowthChart from '../components/analytics/BookingGrowthChart';
import OccupancyTrends from '../components/analytics/OccupancyTrends';
import BookingSources from '../components/analytics/BookingSources';
import PopularLocations from '../components/analytics/PopularLocations';
import PropertyPerformance from '../components/analytics/PropertyPerformance';
import ActivityFeed from '../components/dashboard/ActivityFeed'; // Reusing existing feed
import { 
  analyticsSummaryData, 
  revenueAnalyticsData, 
  occupancyTrendsData,
  bookingSourcesData,
  popularLocationsData,
  propertyPerformanceData,
  liveActivityAnalyticsData
} from '../data/mockData';
import styles from './Analytics.module.css';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30');
  const [isLoading, setIsLoading] = useState(false);

  // Simulate data fetching when date range changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // 800ms simulated load time
    
    return () => clearTimeout(timer);
  }, [dateRange]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value,Trend\n"
      + `Total Revenue,${analyticsSummaryData.totalRevenue.value},${analyticsSummaryData.totalRevenue.trend}%\n`
      + `Monthly Revenue,${analyticsSummaryData.monthlyRevenue.value},${analyticsSummaryData.monthlyRevenue.trend}%\n`
      + `Booking Growth,${analyticsSummaryData.bookingGrowth.value},${analyticsSummaryData.bookingGrowth.trend}%\n`
      + `Average Occupancy,${analyticsSummaryData.avgOccupancy.value},${analyticsSummaryData.avgOccupancy.trend}%\n`
      + `Active Users,${analyticsSummaryData.activeUsers.value},${analyticsSummaryData.activeUsers.trend}%\n`
      + "\nTop Locations,Bookings,Revenue\n"
      + popularLocationsData.map(l => `"${l.city}",${l.bookings},"${l.revenue}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lotnis_analytics_export_${dateRange}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.page}>
      <AnalyticsHeader 
        dateRange={dateRange} 
        setDateRange={setDateRange} 
        onExport={handleExportCSV}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      <div className={`${styles.dashboardGrid} ${isLoading ? styles.loadingOverlay : ''}`}>
        
        <AnalyticsSummary data={analyticsSummaryData} />

        <div className={styles.chartsRow}>
          <div className={styles.chartContainer}>
            <RevenueCharts data={revenueAnalyticsData} />
          </div>
          <div className={styles.chartContainer}>
            <BookingGrowthChart data={revenueAnalyticsData} />
          </div>
        </div>

        <div className={`${styles.chartsRow} ${styles.chartsRowEqual}`}>
          <div className={styles.chartContainerSmall}>
            <OccupancyTrends data={occupancyTrendsData} />
          </div>
          <div className={styles.chartContainerSmall}>
            <BookingSources data={bookingSourcesData} />
          </div>
        </div>

        <div className={styles.dataRow}>
          <PopularLocations data={popularLocationsData} />
          <PropertyPerformance data={propertyPerformanceData} />
          <ActivityFeed activities={liveActivityAnalyticsData} title="Live Platform Activity" />
        </div>

      </div>
    </div>
  );
}
