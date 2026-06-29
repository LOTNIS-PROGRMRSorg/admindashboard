import React, { useState, useMemo } from 'react';
import styles from './Reports.module.css';
import pageStyles from './Page.module.css';

// Components
import StatCard from '../components/reports/StatCard';
import Controls from '../components/reports/Controls';
import ReportsTable from '../components/reports/ReportsTable';
import Pagination from '../components/reports/Pagination';
import FlaggedListingCard from '../components/reports/FlaggedListingCard';
import ModerationModal from '../components/reports/ModerationModal';

// Mock Data
import { reportsData, flaggedListings, statsData, moderationTimeline } from '../data/reportsData';

export default function Reports() {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  
  const itemsPerPage = 5;

  // Derived Data (Filtering)
  const filteredReports = useMemo(() => {
    return reportsData.filter((report) => {
      const matchesSearch = 
        report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reportedEntity.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleExport = () => {
    // Frontend mock export to CSV
    const headers = ['ID', 'Category', 'Reporter', 'Entity', 'Date', 'Priority', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredReports.map(r => 
        [r.id, r.category, `"${r.reporterName}"`, `"${r.reportedEntity}"`, r.submittedDate, r.priority, r.status].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'lotnis_reports_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
  };

  const handleModalAction = (action, id) => {
    const confirmMessage = `Are you sure you want to ${action} this report?`;
    if (window.confirm(confirmMessage)) {
      alert(`Action '${action}' performed on ID: ${id} (Mock implementation)`);
      handleCloseModal();
    }
  };

  const handleListingAction = (action, id) => {
    if (action === 'view') {
      alert(`Opening listing ${id} in a new tab...`);
    } else {
      if (window.confirm(`Are you sure you want to ${action} listing ${id}?`)) {
        alert(`Listing ${id} has been suspended.`);
      }
    }
  };

  return (
    <div className={pageStyles.page}>
      {/* Header */}
      <div className={pageStyles.header}>
        <div>
          <h1 className={pageStyles.title}>Reports & Complaints</h1>
          <p className={pageStyles.subtitle} style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Monitor user complaints, flagged listings, and moderation activity across the Lotnis platform.
          </p>
        </div>
        <button className={styles.exportBtn} onClick={handleExport}>
          Export Reports
        </button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <StatCard 
          title="Total Reports" 
          value={statsData.totalReports} 
          icon={<span style={{fontSize:'1.25rem'}}>📄</span>} 
        />
        <StatCard 
          title="Pending Investigations" 
          value={statsData.pendingInvestigations} 
          icon={<span style={{fontSize:'1.25rem'}}>🔍</span>} 
          color="warning" 
        />
        <StatCard 
          title="High Priority Cases" 
          value={statsData.highPriorityCases} 
          icon={<span style={{fontSize:'1.25rem'}}>⚠️</span>} 
          color="danger" 
        />
        <StatCard 
          title="Flagged Listings" 
          value={statsData.flaggedListings} 
          icon={<span style={{fontSize:'1.25rem'}}>🏠</span>} 
        />
      </div>

      {/* Main Layout: Table + Flagged Listings */}
      <div className={styles.mainLayout}>
        {/* Left Column: Reports Table */}
        <div className={styles.tableSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Complaints</h2>
          </div>
          
          <Controls 
            searchTerm={searchTerm}
            onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
            statusFilter={statusFilter}
            onStatusFilterChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
          />

          <ReportsTable 
            data={paginatedReports} 
            onViewDetails={handleViewDetails}
          />

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Right Column: Flagged Listings */}
        <div className={styles.listingsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Flagged Listings</h2>
            <span className={styles.badgeCount}>{flaggedListings.length} Action Required</span>
          </div>
          <div className={styles.listingsGrid}>
            {flaggedListings.map(listing => (
              <FlaggedListingCard 
                key={listing.id} 
                listing={listing} 
                onAction={handleListingAction}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedReport && (
        <ModerationModal 
          report={selectedReport}
          timelineEvents={moderationTimeline[selectedReport.id] || []}
          onClose={handleCloseModal}
          onAction={handleModalAction}
        />
      )}
    </div>
  );
}
