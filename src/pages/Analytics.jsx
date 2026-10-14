import { useMemo, useState } from 'react';
import AnalyticsHeader from '../components/analytics/AnalyticsHeader';
import AnalyticsSummary from '../components/analytics/AnalyticsSummary';
import RevenueCharts from '../components/analytics/RevenueCharts';
import BookingGrowthChart from '../components/analytics/BookingGrowthChart';
import PopularLocations from '../components/analytics/PopularLocations';
import PropertyPerformance from '../components/analytics/PropertyPerformance';
import { bookingsData, listingsData } from '../data/mockData';
import styles from './Analytics.module.css';

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function getRangeStart(range, today) {
  const start = new Date(`${today}T00:00:00.000Z`);
  if (range === '7') start.setUTCDate(start.getUTCDate() - 6);
  if (range === '30') start.setUTCDate(start.getUTCDate() - 29);
  if (range === '6m') {
    start.setUTCDate(1);
    start.setUTCMonth(start.getUTCMonth() - 5);
  }
  if (range === '12m') {
    start.setUTCDate(1);
    start.setUTCMonth(start.getUTCMonth() - 11);
  }
  return isoDate(start);
}

function formatPeriod(value, range) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return new Intl.DateTimeFormat('en', range === '7' || range === '30'
    ? { month: 'short', day: 'numeric', timeZone: 'UTC' }
    : { month: 'short', year: '2-digit', timeZone: 'UTC' }).format(date);
}

function makeTrendData(records, start, today, range) {
  const monthly = range === '6m' || range === '12m';
  const buckets = new Map();
  const cursor = new Date(`${start}T00:00:00.000Z`);
  const end = new Date(`${today}T00:00:00.000Z`);
  if (monthly) cursor.setUTCDate(1);

  while (cursor <= end) {
    const key = monthly ? isoDate(cursor).slice(0, 7) : isoDate(cursor);
    buckets.set(key, { key, name: formatPeriod(monthly ? `${key}-01` : key, range), bookings: 0, amount: 0 });
    if (monthly) cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    else cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  records.forEach((booking) => {
    const key = monthly ? booking.bookingDate.slice(0, 7) : booking.bookingDate;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.bookings += 1;
      bucket.amount += Number(booking.totalAmount) || 0;
    }
  });
  return [...buckets.values()];
}

function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30');
  const [sampleBookings, setSampleBookings] = useState(() => [...bookingsData]);
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);
  const [today] = useState(() => isoDate(new Date()));
  const startDate = getRangeStart(dateRange, today);

  const filteredBookings = useMemo(() => sampleBookings.filter((booking) => (
    booking.bookingDate && booking.bookingDate >= startDate && booking.bookingDate <= today
  )), [sampleBookings, startDate, today]);

  const trendData = useMemo(
    () => makeTrendData(filteredBookings, startDate, today, dateRange),
    [filteredBookings, startDate, today, dateRange],
  );

  const summary = useMemo(() => {
    const amount = filteredBookings.reduce((sum, booking) => sum + (Number(booking.totalAmount) || 0), 0);
    return {
      bookingCount: filteredBookings.length,
      listedAmount: amount,
      paidCount: filteredBookings.filter((booking) => booking.paymentStatus === 'Paid').length,
      averageAmount: filteredBookings.length ? Math.round(amount / filteredBookings.length) : 0,
    };
  }, [filteredBookings]);

  const performance = useMemo(() => {
    const listingsByName = new Map(listingsData.map((listing) => [listing.title, listing]));
    const properties = new Map();
    const locations = new Map();
    let unmatchedBookingCount = 0;

    filteredBookings.forEach((booking) => {
      const listing = listingsByName.get(booking.propertyName);
      if (!listing) {
        unmatchedBookingCount += 1;
        return;
      }

      const amount = Number(booking.totalAmount) || 0;
      const property = properties.get(listing.id) || { ...listing, bookings: 0, listedAmount: 0 };
      property.bookings += 1;
      property.listedAmount += amount;
      properties.set(listing.id, property);

      const city = listing.location.split(',')[0].trim();
      const location = locations.get(city) || { city, bookings: 0, listedAmount: 0 };
      location.bookings += 1;
      location.listedAmount += amount;
      locations.set(city, location);
    });

    return {
      properties: [...properties.values()].sort((a, b) => b.bookings - a.bookings || b.listedAmount - a.listedAmount),
      locations: [...locations.values()].sort((a, b) => b.bookings - a.bookings || b.listedAmount - a.listedAmount),
      unmatchedBookingCount,
    };
  }, [filteredBookings]);

  const handleExport = () => {
    if (filteredBookings.length === 0) return;
    const columns = [
      ['Booking ID', 'id'], ['Booking date', 'bookingDate'], ['Guest', 'guestName'], ['Guest email', 'guestEmail'],
      ['Host', 'hostName'], ['Property', 'propertyName'], ['Check-in date', 'checkInDate'], ['Check-out date', 'checkOutDate'],
      ['Guests', 'guestsCount'], ['Booking amount ($)', 'totalAmount'], ['Booking status', 'bookingStatus'], ['Payment status', 'paymentStatus'],
    ];
    const rows = [columns.map(([label]) => csvCell(label)).join(','), ...filteredBookings.map((booking) => columns.map(([, key]) => csvCell(booking[key])).join(','))];
    const blob = new Blob([`\uFEFF${rows.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lotnis_analytics_bookings_${dateRange}_${today}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const handleRefresh = () => {
    setSampleBookings([...bookingsData]);
    setShowRefreshMessage(true);
  };

  return (
    <div className={styles.page}>
      <AnalyticsHeader
        dateRange={dateRange}
        setDateRange={setDateRange}
        onExport={handleExport}
        onRefresh={handleRefresh}
        exportCount={filteredBookings.length}
      />

      <div className={styles.dataNotice}>
        <strong>Sample analytics.</strong> Results use booking records dated {startDate} through {today}. Booking amounts are listed totals, not verified revenue. Occupancy, traffic source, conversion, and active-user data are unavailable in these records.
      </div>
      {showRefreshMessage && <p className={styles.refreshMessage} role="status">Sample metrics recalculated locally. No live data was fetched.</p>}
      <AnalyticsSummary data={summary} />

      {filteredBookings.length === 0 && (
        <div className={styles.emptyNotice}>No booking records fall within this date range. Select a wider range to view sample activity.</div>
      )}

      <div className={styles.chartsRow}>
        <RevenueCharts data={trendData} />
        <BookingGrowthChart data={trendData} />
      </div>

      <div className={styles.performanceRow}>
        <PopularLocations data={performance.locations} />
        <PropertyPerformance data={performance.properties} />
      </div>
      {performance.unmatchedBookingCount > 0 && <p className={styles.mappingNote}>{performance.unmatchedBookingCount} booking record(s) could not be matched to a listing location.</p>}
    </div>
  );
}
