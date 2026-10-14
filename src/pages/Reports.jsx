import { useMemo, useState } from 'react';
import { AlertTriangle, Clock3, FileText, House } from 'lucide-react';
import styles from './Reports.module.css';
import StatCard from '../components/reports/StatCard';
import Controls from '../components/reports/Controls';
import ReportsTable from '../components/reports/ReportsTable';
import Pagination from '../components/reports/Pagination';
import FlaggedListingCard from '../components/reports/FlaggedListingCard';
import ModerationModal from '../components/reports/ModerationModal';
import ConfirmModal from '../components/users/ConfirmModal';
import { reportsData as initialReports, flaggedListings, moderationTimeline } from '../data/reportsData';

const ITEMS_PER_PAGE = 5;

function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export default function Reports() {
  const [reports, setReports] = useState(initialReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const categories = useMemo(() => [...new Set(reports.map((report) => report.category).filter(Boolean))].sort(), [reports]);
  const filteredReports = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return reports.filter((report) => {
      const searchableFields = [report.id, report.category, report.reporterName, report.reportedEntity, report.submittedDate, report.priority, report.status, report.assignedModerator, report.reportReason, report.notes];
      const matchesSearch = !query || searchableFields.some((field) => String(field ?? '').toLowerCase().includes(query));
      return matchesSearch
        && (statusFilter === 'All' || report.status === statusFilter)
        && (categoryFilter === 'All' || report.category === categoryFilter)
        && (priorityFilter === 'All' || report.priority === priorityFilter);
    });
  }, [reports, searchTerm, statusFilter, categoryFilter, priorityFilter]);

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const page = Math.min(currentPage, Math.max(totalPages, 1));
  const pageReports = filteredReports.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const hasActiveFilters = Boolean(searchTerm.trim()) || statusFilter !== 'All' || categoryFilter !== 'All' || priorityFilter !== 'All';
  const activeReportCount = reports.filter((report) => ['Pending', 'Under Review', 'Escalated'].includes(report.status)).length;
  const highPriorityCount = reports.filter((report) => ['High', 'Critical'].includes(report.priority)).length;

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setPriorityFilter('All');
    setCurrentPage(1);
  };
  const updateFilter = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const exportReports = () => {
    if (filteredReports.length === 0) return;
    const columns = [
      ['Report ID', 'id'], ['Category', 'category'], ['Reporter', 'reporterName'], ['Reported item or person', 'reportedEntity'],
      ['Submitted at', 'submittedDate'], ['Priority', 'priority'], ['Status', 'status'], ['Assigned moderator', 'assignedModerator'],
      ['Report reason', 'reportReason'], ['Moderator notes', 'notes'],
    ];
    const lines = [columns.map(([label]) => csvCell(label)).join(','), ...filteredReports.map((report) => columns.map(([, key]) => csvCell(report[key])).join(','))];
    const blob = new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lotnis_sample_reports_filtered.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const openDetails = (report) => {
    setSelectedReport(report);
    setIsDetailsOpen(true);
  };
  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedReport(null);
  };
  const requestReportAction = (action, id) => {
    setPendingAction({ action, id });
    setIsDetailsOpen(false);
  };
  const closeConfirmation = () => {
    setPendingAction(null);
    setIsDetailsOpen(Boolean(selectedReport));
  };
  const confirmReportAction = () => {
    if (!pendingAction) return;
    const nextStatus = pendingAction.action === 'resolve' ? 'Resolved' : pendingAction.action === 'dismiss' ? 'Closed' : 'Pending';
    const updatedReport = reports.find((report) => report.id === pendingAction.id);
    if (!updatedReport) return;
    const nextReport = { ...updatedReport, status: nextStatus };
    setReports((current) => current.map((report) => report.id === nextReport.id ? nextReport : report));
    setSelectedReport(nextReport);
    setCurrentPage(1);
    setPendingAction(null);
    setIsDetailsOpen(true);
  };

  const confirmTitle = pendingAction?.action === 'resolve'
    ? 'Mark report as resolved?'
    : pendingAction?.action === 'dismiss'
      ? 'Close this report?'
      : 'Reopen this report?';
  const confirmMessage = pendingAction?.action === 'resolve'
    ? `Mark report ${pendingAction?.id} as resolved in the local sample data?`
    : pendingAction?.action === 'dismiss'
      ? `Close report ${pendingAction?.id} in the local sample data?`
      : `Reopen report ${pendingAction?.id} as pending in the local sample data?`;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>TRUST &amp; SAFETY</p>
          <h1 className={styles.title}>Reports &amp; complaints</h1>
          <p className={styles.subtitle}>Review the available report records and flagged listing samples.</p>
        </div>
        <button type="button" className={styles.exportBtn} onClick={exportReports} disabled={!filteredReports.length}>
          <FileText size={16} /> Export filtered reports <span>({filteredReports.length})</span>
        </button>
      </header>

      <p className={styles.sampleNote}><strong>Sample data.</strong> Counts and moderation actions below apply only to local records; they do not contact users, investigate complaints, or change live listings.</p>

      <section className={styles.statsGrid} aria-label="Report counts from sample data">
        <StatCard title="Reports in sample" value={reports.length} icon={<FileText size={20} />} />
        <StatCard title="Open reports" value={activeReportCount} icon={<Clock3 size={20} />} color="warning" />
        <StatCard title="High / critical priority" value={highPriorityCount} icon={<AlertTriangle size={20} />} color="danger" />
        <StatCard title="Flagged listing samples" value={flaggedListings.length} icon={<House size={20} />} />
      </section>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <div><h2 className={styles.sectionTitle}>Report records</h2><p className={styles.sectionHint}>{filteredReports.length} matching sample record{filteredReports.length === 1 ? '' : 's'}</p></div>
        </div>
        <Controls
          searchTerm={searchTerm} onSearchChange={updateFilter(setSearchTerm)}
          statusFilter={statusFilter} onStatusFilterChange={updateFilter(setStatusFilter)}
          categoryFilter={categoryFilter} onCategoryFilterChange={updateFilter(setCategoryFilter)}
          priorityFilter={priorityFilter} onPriorityFilterChange={updateFilter(setPriorityFilter)}
          categories={categories} hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters}
        />
        <ReportsTable data={pageReports} onViewDetails={openDetails} hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters} />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={(nextPage) => setCurrentPage(Math.max(1, Math.min(nextPage, Math.max(totalPages, 1))))} />
      </section>

      <section className={styles.listingsSection}>
        <div className={styles.sectionHeader}>
          <div><h2 className={styles.sectionTitle}>Flagged listings</h2><p className={styles.sectionHint}>Separate sample listing records; they are not linked to the report list.</p></div>
          <span className={styles.badgeCount}>{flaggedListings.length} samples</span>
        </div>
        {flaggedListings.length ? <div className={styles.listingsGrid}>{flaggedListings.map((listing) => <FlaggedListingCard key={listing.id} listing={listing} />)}</div> : <p className={styles.noListings}>No flagged listing records are available in the sample data.</p>}
      </section>

      {isDetailsOpen && selectedReport && <ModerationModal report={selectedReport} timelineEvents={moderationTimeline[selectedReport.id] || []} onClose={closeDetails} onAction={requestReportAction} />}
      <ConfirmModal
        isOpen={Boolean(pendingAction)} onClose={closeConfirmation} onConfirm={confirmReportAction}
        title={confirmTitle} message={confirmMessage}
        note="This only updates the local sample report. No user is contacted, no investigation is performed, and no listing or account is changed."
        confirmText={pendingAction?.action === 'resolve' ? 'Mark resolved' : pendingAction?.action === 'dismiss' ? 'Close report' : 'Reopen report'}
        isDanger={pendingAction?.action === 'dismiss'}
      />
    </div>
  );
}
