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
  dailyAnalyticsData,
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
  const trendData = dateRange === '7'
    ? dailyAnalyticsData.slice(-7)
    : dateRange === '30'
      ? dailyAnalyticsData
      : dateRange === '180'
        ? revenueAnalyticsData.slice(-6)
        : revenueAnalyticsData;

  // Simulate data fetching when date range changes
  useEffect(() => {
    if (!isLoading) return undefined;

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // 800ms simulated load time
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleDateRangeChange = (value) => {
    setDateRange(value);
    setIsLoading(true);
  };

  const handleRefresh = () => {
    setIsLoading(true);
  };

  const handleExportCSV = () => {
    const summaryRows = Object.entries(analyticsSummaryData).map(([metric, values]) => [
      'Summary', metric, values.value, `${values.trend}% trend`,
    ]);
    const revenueRows = trendData.map((point) => [
      'Revenue Trends', point.month, point.revenue, 'Demo currency: USD',
    ]);
    const bookingRows = trendData.map((point) => [
      'Booking Volume', point.month, point.bookings, 'Bookings',
    ]);
    const occupancyRows = occupancyTrendsData.map((item) => [
      'Occupancy by Property Type', item.name, `${item.value}%`, 'Demo occupancy rate',
    ]);
    const sourceRows = bookingSourcesData.map((item) => [
      'Traffic & Booking Sources', item.name, `${item.value}%`, 'Demo share',
    ]);
    const locationRows = popularLocationsData.map((item) => [
      'Top Locations', item.city, item.bookings, item.revenue,
    ]);
    const csvRows = [
      ['Data note', 'DEMO DATA - not live Lotnis business results'],
      [],
      ['Section', 'Metric / period', 'Value', 'Notes'],
      ...summaryRows,
      ...revenueRows,
      ...bookingRows,
      ...occupancyRows,
      ...sourceRows,
      ...locationRows,
    ];
    const csvContent = csvRows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const encodedUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
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
        setDateRange={handleDateRangeChange}
        onExport={handleExportCSV}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      <div className={`${styles.dashboardGrid} ${isLoading ? styles.loadingOverlay : ''}`}>
        
        <AnalyticsSummary data={analyticsSummaryData} />

        <div className={styles.chartsRow}>
          <div className={styles.chartContainer}>
          <RevenueCharts data={trendData} />
          </div>
          <div className={styles.chartContainer}>
            <BookingGrowthChart data={trendData} />
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
